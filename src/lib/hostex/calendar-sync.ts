import { HostexClient, Availability, Reservation } from './client'
import { auditLogger } from './config'
import { format, addDays, parseISO, isAfter, isBefore, isEqual } from 'date-fns'

export interface CalendarEvent {
  id: string
  propertyId: string
  type: 'reservation' | 'blocked' | 'available'
  startDate: string
  endDate: string
  title: string
  source: string // channel that created the event
  guestInfo?: {
    name: string
    email: string
    phone?: string
  }
  amount?: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  lastUpdated: string
}

export interface SyncConflict {
  id: string
  propertyId: string
  date: string
  type: 'overbooking' | 'availability_mismatch' | 'price_conflict'
  description: string
  sources: string[]
  resolution?: 'manual' | 'auto_block' | 'auto_cancel'
  resolvedAt?: string
}

export interface CalendarSyncResult {
  success: boolean
  propertyId: string
  eventsUpdated: number
  conflictsDetected: SyncConflict[]
  errors: string[]
  lastSync: string
}

export class CalendarSyncManager {
  private client: HostexClient
  private calendars: Map<string, CalendarEvent[]> = new Map()
  private conflicts: Map<string, SyncConflict[]> = new Map()
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map()

  constructor(client: HostexClient) {
    this.client = client
  }

  // Main sync methods
  async syncPropertyCalendar(
    propertyId: string,
    dateRange?: { start: string; end: string }
  ): Promise<CalendarSyncResult> {
    try {
      auditLogger.log('SYNC_CALENDAR', {
        action: 'start',
        propertyId,
        dateRange,
      })

      const startDate = dateRange?.start || format(new Date(), 'yyyy-MM-dd')
      const endDate =
        dateRange?.end || format(addDays(new Date(), 365), 'yyyy-MM-dd')

      // Fetch current availability and reservations
      const [availability, reservations] = await Promise.all([
        this.client.getAvailability(propertyId, startDate, endDate),
        this.client.getReservations(propertyId),
      ])

      // Convert to calendar events
      const events = this.convertToCalendarEvents(
        propertyId,
        availability,
        reservations
      )

      // Detect conflicts
      const conflicts = this.detectConflicts(propertyId, events)

      // Store in cache
      this.calendars.set(propertyId, events)
      this.conflicts.set(propertyId, conflicts)

      // Auto-resolve conflicts where possible
      const resolvedConflicts = await this.autoResolveConflicts(
        propertyId,
        conflicts
      )

      const result: CalendarSyncResult = {
        success: true,
        propertyId,
        eventsUpdated: events.length,
        conflictsDetected: conflicts,
        errors: [],
        lastSync: new Date().toISOString(),
      }

      auditLogger.log('SYNC_CALENDAR', {
        action: 'complete',
        propertyId,
        result: {
          eventsUpdated: result.eventsUpdated,
          conflictsCount: conflicts.length,
          resolvedConflicts: resolvedConflicts.length,
        },
      })

      return result
    } catch (error) {
      const result: CalendarSyncResult = {
        success: false,
        propertyId,
        eventsUpdated: 0,
        conflictsDetected: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        lastSync: new Date().toISOString(),
      }

      auditLogger.log('SYNC_CALENDAR', {
        action: 'error',
        propertyId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return result
    }
  }

  async updateAvailability(
    propertyId: string,
    dates: { date: string; available: boolean; price?: number }[]
  ): Promise<void> {
    try {
      auditLogger.log('UPDATE_AVAILABILITY', {
        action: 'start',
        propertyId,
        datesCount: dates.length,
      })

      const availability: Omit<Availability, 'propertyId'>[] = dates.map(
        (d) => ({
          date: d.date,
          available: d.available,
          price: d.price || 0,
          minStay: 1,
          currency: 'BRL',
        })
      )

      await this.client.updateAvailability(propertyId, availability)

      // Update local cache
      await this.syncPropertyCalendar(propertyId)

      auditLogger.log('UPDATE_AVAILABILITY', {
        action: 'complete',
        propertyId,
        datesCount: dates.length,
      })
    } catch (error) {
      auditLogger.log('UPDATE_AVAILABILITY', {
        action: 'error',
        propertyId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  // Real-time sync management
  startRealTimeSync(propertyId: string, intervalMs = 300000): void {
    // 5 minutes default
    this.stopRealTimeSync(propertyId) // Clear existing interval

    const interval = setInterval(async () => {
      try {
        await this.syncPropertyCalendar(propertyId)
      } catch (error) {
        console.error(`Real-time sync error for property ${propertyId}:`, error)
      }
    }, intervalMs)

    this.syncIntervals.set(propertyId, interval)

    auditLogger.log('START_REALTIME_SYNC', {
      propertyId,
      intervalMs,
    })
  }

  stopRealTimeSync(propertyId: string): void {
    const interval = this.syncIntervals.get(propertyId)
    if (interval) {
      clearInterval(interval)
      this.syncIntervals.delete(propertyId)

      auditLogger.log('STOP_REALTIME_SYNC', { propertyId })
    }
  }

  stopAllRealTimeSync(): void {
    for (const propertyId of this.syncIntervals.keys()) {
      this.stopRealTimeSync(propertyId)
    }
  }

  // Conflict detection and resolution
  private detectConflicts(
    propertyId: string,
    events: CalendarEvent[]
  ): SyncConflict[] {
    const conflicts: SyncConflict[] = []
    const dateMap: Map<string, CalendarEvent[]> = new Map()

    // Group events by date
    events.forEach((event) => {
      const startDate = parseISO(event.startDate)
      const endDate = parseISO(event.endDate)

      let currentDate = startDate
      while (isBefore(currentDate, endDate) || isEqual(currentDate, endDate)) {
        const dateStr = format(currentDate, 'yyyy-MM-dd')
        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, [])
        }
        dateMap.get(dateStr)!.push(event)
        currentDate = addDays(currentDate, 1)
      }
    })

    // Check for conflicts
    dateMap.forEach((dayEvents, date) => {
      const reservations = dayEvents.filter(
        (e) => e.type === 'reservation' && e.status === 'confirmed'
      )
      const blocked = dayEvents.filter((e) => e.type === 'blocked')

      // Overbooking detection
      if (reservations.length > 1) {
        conflicts.push({
          id: crypto.randomUUID(),
          propertyId,
          date,
          type: 'overbooking',
          description: `Multiple reservations on ${date}`,
          sources: reservations.map((r) => r.source),
        })
      }

      // Availability mismatch
      const availableEvents = dayEvents.filter((e) => e.type === 'available')
      if (reservations.length > 0 && availableEvents.length > 0) {
        conflicts.push({
          id: crypto.randomUUID(),
          propertyId,
          date,
          type: 'availability_mismatch',
          description: `Property marked as available but has reservation on ${date}`,
          sources: [
            ...reservations.map((r) => r.source),
            ...availableEvents.map((a) => a.source),
          ],
        })
      }

      // Price conflicts (different prices from different sources)
      const priceEvents = dayEvents.filter((e) => e.amount && e.amount > 0)
      const uniquePrices = [...new Set(priceEvents.map((e) => e.amount))]
      if (uniquePrices.length > 1) {
        conflicts.push({
          id: crypto.randomUUID(),
          propertyId,
          date,
          type: 'price_conflict',
          description: `Different prices found for ${date}: ${uniquePrices.join(', ')}`,
          sources: priceEvents.map((p) => p.source),
        })
      }
    })

    return conflicts
  }

  private async autoResolveConflicts(
    propertyId: string,
    conflicts: SyncConflict[]
  ): Promise<SyncConflict[]> {
    const resolved: SyncConflict[] = []

    for (const conflict of conflicts) {
      try {
        switch (conflict.type) {
          case 'overbooking':
            // Block the date to prevent further bookings
            await this.updateAvailability(propertyId, [
              {
                date: conflict.date,
                available: false,
              },
            ])
            conflict.resolution = 'auto_block'
            conflict.resolvedAt = new Date().toISOString()
            resolved.push(conflict)
            break

          case 'availability_mismatch':
            // If there's a confirmed reservation, mark as unavailable
            await this.updateAvailability(propertyId, [
              {
                date: conflict.date,
                available: false,
              },
            ])
            conflict.resolution = 'auto_block'
            conflict.resolvedAt = new Date().toISOString()
            resolved.push(conflict)
            break

          case 'price_conflict':
            // Price conflicts require manual resolution
            conflict.resolution = 'manual'
            break
        }
      } catch (error) {
        console.error(`Error auto-resolving conflict ${conflict.id}:`, error)
      }
    }

    if (resolved.length > 0) {
      auditLogger.log('AUTO_RESOLVE_CONFLICTS', {
        propertyId,
        resolvedCount: resolved.length,
        conflicts: resolved.map((c) => ({
          id: c.id,
          type: c.type,
          resolution: c.resolution,
        })),
      })
    }

    return resolved
  }

  private convertToCalendarEvents(
    propertyId: string,
    availability: Availability[],
    reservations: Reservation[]
  ): CalendarEvent[] {
    const events: CalendarEvent[] = []

    // Convert availability to events
    availability.forEach((avail) => {
      events.push({
        id: `avail-${propertyId}-${avail.date}`,
        propertyId,
        type: avail.available ? 'available' : 'blocked',
        startDate: avail.date,
        endDate: avail.date,
        title: avail.available ? `Disponível - R$ ${avail.price}` : 'Bloqueado',
        source: 'hostex',
        amount: avail.price,
        status: 'confirmed',
        lastUpdated: new Date().toISOString(),
      })
    })

    // Convert reservations to events
    reservations.forEach((reservation) => {
      events.push({
        id: `res-${reservation.id}`,
        propertyId: reservation.propertyId,
        type: 'reservation',
        startDate: reservation.checkIn,
        endDate: reservation.checkOut,
        title: `${reservation.guestName} - ${reservation.channel}`,
        source: reservation.channel,
        guestInfo: {
          name: reservation.guestName,
          email: reservation.guestEmail,
          phone: reservation.guestPhone,
        },
        amount: reservation.totalAmount,
        status: reservation.status,
        lastUpdated: reservation.updatedAt,
      })
    })

    return events
  }

  // Public getters
  getCalendarEvents(
    propertyId: string,
    dateRange?: { start: string; end: string }
  ): CalendarEvent[] {
    const events = this.calendars.get(propertyId) || []

    if (!dateRange) return events

    const startDate = parseISO(dateRange.start)
    const endDate = parseISO(dateRange.end)

    return events.filter((event) => {
      const eventStart = parseISO(event.startDate)
      const eventEnd = parseISO(event.endDate)

      return (
        (isAfter(eventStart, startDate) || isEqual(eventStart, startDate)) &&
        (isBefore(eventEnd, endDate) || isEqual(eventEnd, endDate))
      )
    })
  }

  getConflicts(propertyId: string): SyncConflict[] {
    return this.conflicts.get(propertyId) || []
  }

  getUnresolvedConflicts(propertyId: string): SyncConflict[] {
    const conflicts = this.conflicts.get(propertyId) || []
    return conflicts.filter((c) => !c.resolution)
  }

  isRealTimeSyncActive(propertyId: string): boolean {
    return this.syncIntervals.has(propertyId)
  }

  // Utility methods
  async getOccupancyRate(
    propertyId: string,
    dateRange: { start: string; end: string }
  ): Promise<number> {
    const events = this.getCalendarEvents(propertyId, dateRange)
    const reservations = events.filter(
      (e) => e.type === 'reservation' && e.status === 'confirmed'
    )

    const startDate = parseISO(dateRange.start)
    const endDate = parseISO(dateRange.end)
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    let occupiedDays = 0
    reservations.forEach((reservation) => {
      const resStart = parseISO(reservation.startDate)
      const resEnd = parseISO(reservation.endDate)
      const days = Math.ceil(
        (resEnd.getTime() - resStart.getTime()) / (1000 * 60 * 60 * 24)
      )
      occupiedDays += days
    })

    return totalDays > 0 ? (occupiedDays / totalDays) * 100 : 0
  }

  async getRevenue(
    propertyId: string,
    dateRange: { start: string; end: string }
  ): Promise<number> {
    const events = this.getCalendarEvents(propertyId, dateRange)
    const reservations = events.filter(
      (e) =>
        e.type === 'reservation' &&
        (e.status === 'confirmed' || e.status === 'pending') &&
        e.amount
    )

    return reservations.reduce((total, res) => total + (res.amount || 0), 0)
  }
}
