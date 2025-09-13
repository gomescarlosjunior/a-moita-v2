import { HostexClient, Property, Reservation, Availability } from './client'
import { auditLogger } from './config'
import { format, addDays, parseISO } from 'date-fns'

export interface Channel {
  id: string
  name: string
  type: 'airbnb' | 'booking' | 'vrbo' | 'direct' | 'other'
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  lastSync?: string
  credentials?: Record<string, any>
  syncErrors?: string[]
}

export interface PropertyWithChannels extends Property {
  connectedChannels: Channel[]
  syncStatus: 'idle' | 'syncing' | 'error'
  lastSync?: string
  metrics: {
    totalReservations: number
    occupancyRate: number
    averageRate: number
    revenue: number
  }
}

export interface SyncResult {
  success: boolean
  propertyId: string
  channelsUpdated: number
  reservationsUpdated: number
  availabilityUpdated: number
  errors: string[]
}

export class PropertyManager {
  private client: HostexClient
  private properties: Map<string, PropertyWithChannels> = new Map()
  private syncInProgress: Set<string> = new Set()

  constructor(client: HostexClient) {
    this.client = client
  }

  // Property Management
  async loadProperties(): Promise<PropertyWithChannels[]> {
    try {
      auditLogger.log('LOAD_PROPERTIES', { action: 'start' })

      const properties = await this.client.getProperties()
      const propertiesWithChannels: PropertyWithChannels[] = []

      for (const property of properties) {
        const channels = await this.getPropertyChannels(property.id)
        const metrics = await this.calculatePropertyMetrics(property.id)

        const propertyWithChannels: PropertyWithChannels = {
          ...property,
          connectedChannels: channels,
          syncStatus: 'idle',
          metrics,
        }

        this.properties.set(property.id, propertyWithChannels)
        propertiesWithChannels.push(propertyWithChannels)
      }

      auditLogger.log('LOAD_PROPERTIES', {
        action: 'complete',
        count: propertiesWithChannels.length,
      })

      return propertiesWithChannels
    } catch (error) {
      auditLogger.log('LOAD_PROPERTIES', {
        action: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  async getProperty(id: string): Promise<PropertyWithChannels | null> {
    const cached = this.properties.get(id)
    if (cached) return cached

    try {
      const property = await this.client.getProperty(id)
      const channels = await this.getPropertyChannels(id)
      const metrics = await this.calculatePropertyMetrics(id)

      const propertyWithChannels: PropertyWithChannels = {
        ...property,
        connectedChannels: channels,
        syncStatus: 'idle',
        metrics,
      }

      this.properties.set(id, propertyWithChannels)
      return propertyWithChannels
    } catch (error) {
      console.error(`Error loading property ${id}:`, error)
      return null
    }
  }

  async createProperty(
    propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PropertyWithChannels> {
    try {
      auditLogger.log('CREATE_PROPERTY', {
        action: 'start',
        propertyName: propertyData.name,
      })

      const property = await this.client.createProperty(propertyData)

      const propertyWithChannels: PropertyWithChannels = {
        ...property,
        connectedChannels: [],
        syncStatus: 'idle',
        metrics: {
          totalReservations: 0,
          occupancyRate: 0,
          averageRate: 0,
          revenue: 0,
        },
      }

      this.properties.set(property.id, propertyWithChannels)

      auditLogger.log('CREATE_PROPERTY', {
        action: 'complete',
        propertyId: property.id,
      })

      return propertyWithChannels
    } catch (error) {
      auditLogger.log('CREATE_PROPERTY', {
        action: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  // Channel Management
  async getAvailableChannels(): Promise<Channel[]> {
    try {
      const channels = await this.client.getChannels()
      return channels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        type: this.mapChannelType(channel.type),
        status: channel.status as Channel['status'],
      }))
    } catch (error) {
      console.error('Error loading available channels:', error)
      return []
    }
  }

  async connectChannel(
    propertyId: string,
    channelId: string,
    credentials: Record<string, any>,
    userId?: string
  ): Promise<void> {
    try {
      auditLogger.log(
        'CONNECT_CHANNEL',
        {
          action: 'start',
          propertyId,
          channelId,
        },
        userId
      )

      await this.client.connectChannel(propertyId, channelId, credentials)

      // Update local cache
      const property = this.properties.get(propertyId)
      if (property) {
        const channels = await this.getPropertyChannels(propertyId)
        property.connectedChannels = channels
        this.properties.set(propertyId, property)
      }

      auditLogger.log(
        'CONNECT_CHANNEL',
        {
          action: 'complete',
          propertyId,
          channelId,
        },
        userId
      )

      // Trigger initial sync
      await this.syncProperty(propertyId)
    } catch (error) {
      auditLogger.log(
        'CONNECT_CHANNEL',
        {
          action: 'error',
          propertyId,
          channelId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        userId
      )
      throw error
    }
  }

  async disconnectChannel(
    propertyId: string,
    channelId: string,
    userId?: string
  ): Promise<void> {
    try {
      auditLogger.log(
        'DISCONNECT_CHANNEL',
        {
          action: 'start',
          propertyId,
          channelId,
        },
        userId
      )

      await this.client.disconnectChannel(propertyId, channelId)

      // Update local cache
      const property = this.properties.get(propertyId)
      if (property) {
        property.connectedChannels = property.connectedChannels.filter(
          (channel) => channel.id !== channelId
        )
        this.properties.set(propertyId, property)
      }

      auditLogger.log(
        'DISCONNECT_CHANNEL',
        {
          action: 'complete',
          propertyId,
          channelId,
        },
        userId
      )
    } catch (error) {
      auditLogger.log(
        'DISCONNECT_CHANNEL',
        {
          action: 'error',
          propertyId,
          channelId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        userId
      )
      throw error
    }
  }

  // Synchronization
  async syncProperty(propertyId: string): Promise<SyncResult> {
    if (this.syncInProgress.has(propertyId)) {
      throw new Error(`Sync already in progress for property ${propertyId}`)
    }

    this.syncInProgress.add(propertyId)

    try {
      auditLogger.log('SYNC_PROPERTY', {
        action: 'start',
        propertyId,
      })

      // Update sync status
      const property = this.properties.get(propertyId)
      if (property) {
        property.syncStatus = 'syncing'
        this.properties.set(propertyId, property)
      }

      await this.client.syncProperty(propertyId)

      // Reload property data after sync
      const updatedProperty = await this.getProperty(propertyId)
      const syncResult: SyncResult = {
        success: true,
        propertyId,
        channelsUpdated: updatedProperty?.connectedChannels.length || 0,
        reservationsUpdated: 0, // Would be populated by actual sync response
        availabilityUpdated: 0, // Would be populated by actual sync response
        errors: [],
      }

      if (property) {
        property.syncStatus = 'idle'
        property.lastSync = new Date().toISOString()
        this.properties.set(propertyId, property)
      }

      auditLogger.log('SYNC_PROPERTY', {
        action: 'complete',
        propertyId,
        result: syncResult,
      })

      return syncResult
    } catch (error) {
      const property = this.properties.get(propertyId)
      if (property) {
        property.syncStatus = 'error'
        this.properties.set(propertyId, property)
      }

      const syncResult: SyncResult = {
        success: false,
        propertyId,
        channelsUpdated: 0,
        reservationsUpdated: 0,
        availabilityUpdated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }

      auditLogger.log('SYNC_PROPERTY', {
        action: 'error',
        propertyId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return syncResult
    } finally {
      this.syncInProgress.delete(propertyId)
    }
  }

  async syncAllProperties(): Promise<SyncResult[]> {
    const properties = Array.from(this.properties.keys())
    const results: SyncResult[] = []

    auditLogger.log('SYNC_ALL_PROPERTIES', {
      action: 'start',
      propertyCount: properties.length,
    })

    for (const propertyId of properties) {
      try {
        const result = await this.syncProperty(propertyId)
        results.push(result)
      } catch (error) {
        results.push({
          success: false,
          propertyId,
          channelsUpdated: 0,
          reservationsUpdated: 0,
          availabilityUpdated: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        })
      }
    }

    auditLogger.log('SYNC_ALL_PROPERTIES', {
      action: 'complete',
      results: results.map((r) => ({
        propertyId: r.propertyId,
        success: r.success,
      })),
    })

    return results
  }

  // Helper Methods
  private async getPropertyChannels(propertyId: string): Promise<Channel[]> {
    try {
      // This would typically come from the API
      // For now, we'll return mock data based on the property's channels array
      const property = await this.client.getProperty(propertyId)

      return property.channels.map((channelId) => ({
        id: channelId,
        name: this.getChannelName(channelId),
        type: this.mapChannelType(channelId),
        status: 'connected' as const,
        lastSync: new Date().toISOString(),
      }))
    } catch (error) {
      console.error(`Error loading channels for property ${propertyId}:`, error)
      return []
    }
  }

  private async calculatePropertyMetrics(
    propertyId: string
  ): Promise<PropertyWithChannels['metrics']> {
    try {
      const reservations = await this.client.getReservations(propertyId)
      const currentDate = new Date()
      const thirtyDaysAgo = addDays(currentDate, -30)

      const recentReservations = reservations.filter(
        (r) => parseISO(r.createdAt) >= thirtyDaysAgo
      )

      const confirmedReservations = recentReservations.filter(
        (r) => r.status === 'confirmed' || r.status === 'completed'
      )

      const totalRevenue = confirmedReservations.reduce(
        (sum, r) => sum + r.totalAmount,
        0
      )
      const averageRate =
        confirmedReservations.length > 0
          ? totalRevenue / confirmedReservations.length
          : 0

      // Calculate occupancy rate (simplified)
      const occupancyRate =
        confirmedReservations.length > 0
          ? Math.min((confirmedReservations.length / 30) * 100, 100)
          : 0

      return {
        totalReservations: reservations.length,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        averageRate: Math.round(averageRate * 100) / 100,
        revenue: Math.round(totalRevenue * 100) / 100,
      }
    } catch (error) {
      console.error(
        `Error calculating metrics for property ${propertyId}:`,
        error
      )
      return {
        totalReservations: 0,
        occupancyRate: 0,
        averageRate: 0,
        revenue: 0,
      }
    }
  }

  private getChannelName(channelId: string): string {
    const channelNames: Record<string, string> = {
      airbnb: 'Airbnb',
      booking: 'Booking.com',
      vrbo: 'VRBO',
      direct: 'Reserva Direta',
    }
    return channelNames[channelId] || channelId
  }

  private mapChannelType(type: string): Channel['type'] {
    const typeMap: Record<string, Channel['type']> = {
      airbnb: 'airbnb',
      booking: 'booking',
      vrbo: 'vrbo',
      direct: 'direct',
    }
    return typeMap[type.toLowerCase()] || 'other'
  }

  // Public getters
  getProperties(): PropertyWithChannels[] {
    return Array.from(this.properties.values())
  }

  getPropertyById(id: string): PropertyWithChannels | undefined {
    return this.properties.get(id)
  }

  getSyncStatus(propertyId: string): 'idle' | 'syncing' | 'error' | undefined {
    return this.properties.get(propertyId)?.syncStatus
  }

  isSyncInProgress(propertyId: string): boolean {
    return this.syncInProgress.has(propertyId)
  }
}
