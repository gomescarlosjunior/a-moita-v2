import { HostexClient } from './client'
import { PropertyManager, PropertyWithChannels, SyncResult } from './property-manager'
import { CalendarSyncManager, CalendarSyncResult, SyncConflict } from './calendar-sync'
import { MessagingManager, Message, MessageTemplate } from './messaging'
import { getHostexConfig, auditLogger, validateHostexConfig } from './config'

export interface HostexIntegrationStatus {
  isConfigured: boolean
  isConnected: boolean
  lastHealthCheck?: string
  error?: string
}

export interface DashboardMetrics {
  totalRevenue: number
  averageOccupancy: number
  totalReservations: number
  connectedChannels: number
  activeProperties: number
  pendingConflicts: number
  lastSync: string
}

export class HostexIntegration {
  private client: HostexClient | null = null
  private propertyManager: PropertyManager | null = null
  private calendarSync: CalendarSyncManager | null = null
  private messaging: MessagingManager | null = null
  private isInitialized = false

  constructor() {
    this.initialize()
  }

  private async initialize(): Promise<void> {
    try {
      if (!validateHostexConfig()) {
        console.warn('Hostex configuration is invalid or missing')
        return
      }

      const config = getHostexConfig()
      this.client = new HostexClient(config.credentials)
      this.propertyManager = new PropertyManager(this.client)
      this.calendarSync = new CalendarSyncManager(this.client)
      this.messaging = new MessagingManager(this.client)

      this.isInitialized = true

      auditLogger.log('HOSTEX_INTEGRATION_INITIALIZED', {
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to initialize Hostex integration:', error)
      auditLogger.log('HOSTEX_INTEGRATION_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Status and Health Checks
  async getStatus(): Promise<HostexIntegrationStatus> {
    if (!this.isInitialized || !this.client) {
      return {
        isConfigured: false,
        isConnected: false,
        error: 'Integration not initialized'
      }
    }

    try {
      const isConnected = await this.client.healthCheck()
      return {
        isConfigured: true,
        isConnected,
        lastHealthCheck: new Date().toISOString()
      }
    } catch (error) {
      return {
        isConfigured: true,
        isConnected: false,
        lastHealthCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Property Management
  async getProperties(): Promise<PropertyWithChannels[]> {
    this.ensureInitialized()
    return await this.propertyManager!.loadProperties()
  }

  async getProperty(id: string): Promise<PropertyWithChannels | null> {
    this.ensureInitialized()
    return await this.propertyManager!.getProperty(id)
  }

  async syncProperty(propertyId: string): Promise<SyncResult> {
    this.ensureInitialized()
    
    // Sync property data
    const propertyResult = await this.propertyManager!.syncProperty(propertyId)
    
    // Sync calendar
    const calendarResult = await this.calendarSync!.syncPropertyCalendar(propertyId)
    
    return {
      ...propertyResult,
      conflictsDetected: calendarResult.conflictsDetected
    }
  }

  async syncAllProperties(): Promise<SyncResult[]> {
    this.ensureInitialized()
    return await this.propertyManager!.syncAllProperties()
  }

  async connectChannel(
    propertyId: string, 
    channelId: string, 
    credentials: Record<string, any>,
    userId?: string
  ): Promise<void> {
    this.ensureInitialized()
    await this.propertyManager!.connectChannel(propertyId, channelId, credentials, userId)
  }

  async disconnectChannel(propertyId: string, channelId: string, userId?: string): Promise<void> {
    this.ensureInitialized()
    await this.propertyManager!.disconnectChannel(propertyId, channelId, userId)
  }

  // Calendar and Availability
  async getCalendarEvents(propertyId: string, dateRange?: { start: string; end: string }) {
    this.ensureInitialized()
    return this.calendarSync!.getCalendarEvents(propertyId, dateRange)
  }

  async updateAvailability(
    propertyId: string, 
    dates: { date: string; available: boolean; price?: number }[]
  ): Promise<void> {
    this.ensureInitialized()
    await this.calendarSync!.updateAvailability(propertyId, dates)
  }

  async getConflicts(propertyId?: string): Promise<SyncConflict[]> {
    this.ensureInitialized()
    if (propertyId) {
      return this.calendarSync!.getConflicts(propertyId)
    }
    
    // Get conflicts for all properties
    const properties = await this.getProperties()
    const allConflicts: SyncConflict[] = []
    
    for (const property of properties) {
      const conflicts = this.calendarSync!.getConflicts(property.id)
      allConflicts.push(...conflicts)
    }
    
    return allConflicts
  }

  async startRealTimeSync(propertyId: string, intervalMs?: number): Promise<void> {
    this.ensureInitialized()
    this.calendarSync!.startRealTimeSync(propertyId, intervalMs)
  }

  async stopRealTimeSync(propertyId: string): Promise<void> {
    this.ensureInitialized()
    this.calendarSync!.stopRealTimeSync(propertyId)
  }

  // Messaging
  async getMessageTemplates(): Promise<MessageTemplate[]> {
    this.ensureInitialized()
    return this.messaging!.getTemplates()
  }

  async getMessages(reservationId?: string): Promise<Message[]> {
    this.ensureInitialized()
    return this.messaging!.getMessages(reservationId)
  }

  async sendManualMessage(
    reservationId: string,
    content: string,
    channel: Message['channel'] = 'email'
  ): Promise<Message> {
    this.ensureInitialized()
    return await this.messaging!.sendManualMessage(reservationId, content, channel)
  }

  // Dashboard Metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    this.ensureInitialized()
    
    const properties = await this.getProperties()
    const conflicts = await this.getConflicts()
    
    const totalRevenue = properties.reduce((sum, prop) => sum + prop.metrics.revenue, 0)
    const averageOccupancy = properties.length > 0 
      ? properties.reduce((sum, prop) => sum + prop.metrics.occupancyRate, 0) / properties.length 
      : 0
    const totalReservations = properties.reduce((sum, prop) => sum + prop.metrics.totalReservations, 0)
    const connectedChannels = new Set(
      properties.flatMap(p => p.connectedChannels.map(c => c.id))
    ).size
    const activeProperties = properties.filter(p => p.status === 'active').length
    const pendingConflicts = conflicts.filter(c => !c.resolution).length
    
    return {
      totalRevenue,
      averageOccupancy,
      totalReservations,
      connectedChannels,
      activeProperties,
      pendingConflicts,
      lastSync: new Date().toISOString()
    }
  }

  // Event Handlers for Webhooks
  async handleReservationCreated(reservationData: any): Promise<void> {
    this.ensureInitialized()
    
    try {
      auditLogger.log('RESERVATION_CREATED', {
        reservationId: reservationData.id,
        propertyId: reservationData.propertyId
      })

      // Process automated messages
      await this.messaging!.processReservationEvent('booking_confirmed', reservationData)
      
      // Sync calendar to prevent overbooking
      await this.calendarSync!.syncPropertyCalendar(reservationData.propertyId)
    } catch (error) {
      console.error('Error handling reservation created:', error)
    }
  }

  async handleReservationUpdated(reservationData: any): Promise<void> {
    this.ensureInitialized()
    
    try {
      auditLogger.log('RESERVATION_UPDATED', {
        reservationId: reservationData.id,
        propertyId: reservationData.propertyId
      })

      // Sync calendar
      await this.calendarSync!.syncPropertyCalendar(reservationData.propertyId)
    } catch (error) {
      console.error('Error handling reservation updated:', error)
    }
  }

  async handleReservationCancelled(reservationData: any): Promise<void> {
    this.ensureInitialized()
    
    try {
      auditLogger.log('RESERVATION_CANCELLED', {
        reservationId: reservationData.id,
        propertyId: reservationData.propertyId
      })

      // Process cancellation messages
      await this.messaging!.processReservationEvent('cancellation', reservationData)
      
      // Sync calendar to update availability
      await this.calendarSync!.syncPropertyCalendar(reservationData.propertyId)
    } catch (error) {
      console.error('Error handling reservation cancelled:', error)
    }
  }

  // Utility Methods
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.client || !this.propertyManager || !this.calendarSync || !this.messaging) {
      throw new Error('Hostex integration is not properly initialized')
    }
  }

  async cleanup(): Promise<void> {
    if (this.calendarSync) {
      this.calendarSync.stopAllRealTimeSync()
    }
    
    auditLogger.log('HOSTEX_INTEGRATION_CLEANUP', {
      timestamp: new Date().toISOString()
    })
  }
}

// Singleton instance
export const hostexIntegration = new HostexIntegration()

// Export types
export * from './client'
export * from './property-manager'
export * from './calendar-sync'
export * from './messaging'
export * from './config'
