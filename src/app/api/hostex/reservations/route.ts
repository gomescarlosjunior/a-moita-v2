import { NextRequest, NextResponse } from 'next/server'
import { HostexClient } from '@/lib/hostex/client'
import { getHostexConfig } from '@/lib/hostex/config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const config = getHostexConfig()
    const hostex = new HostexClient(config.credentials)

    // Get reservations from Hostex API
    let reservations = await hostex.getReservations(propertyId || undefined)
    if (status) {
      reservations = reservations.filter((r) => r.status === status)
    }
    if (offset) reservations = reservations.slice(offset)
    if (limit) reservations = reservations.slice(0, limit)

    // Transform the data to match our interface
    const transformedReservations = reservations.map((reservation: any) => ({
      id: reservation.id,
      guestName:
        reservation.guestName || reservation.guest?.name || 'Unknown Guest',
      guestEmail: reservation.guestEmail || reservation.guest?.email || '',
      checkIn: reservation.checkIn || reservation.checkInDate,
      checkOut: reservation.checkOut || reservation.checkOutDate,
      guests: reservation.guests || reservation.numberOfGuests || 1,
      status: reservation.status || 'pending',
      channel: reservation.channel || reservation.source || 'direct',
      totalAmount: reservation.totalAmount || reservation.total || 0,
      propertyId: reservation.propertyId || propertyId,
      createdAt: reservation.createdAt || new Date().toISOString(),
      updatedAt: reservation.updatedAt || new Date().toISOString(),
    }))

    return NextResponse.json(transformedReservations)
  } catch (error) {
    console.error('Error fetching reservations:', error)

    // Return mock data for development/testing
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    const mockReservations = [
      {
        id: 'res-001',
        guestName: 'João Silva',
        guestEmail: 'joao.silva@email.com',
        checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        guests: 2,
        status: 'confirmed' as const,
        channel: 'Airbnb',
        totalAmount: 450.0,
        propertyId: propertyId || 'prop-001',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'res-002',
        guestName: 'Maria Santos',
        guestEmail: 'maria.santos@email.com',
        checkIn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        checkOut: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        guests: 4,
        status: 'confirmed' as const,
        channel: 'Booking.com',
        totalAmount: 1050.0,
        propertyId: propertyId || 'prop-001',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'res-003',
        guestName: 'Carlos Ferreira',
        guestEmail: 'carlos.ferreira@email.com',
        checkIn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        checkOut: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        guests: 3,
        status: 'completed' as const,
        channel: 'Airbnb',
        totalAmount: 600.0,
        propertyId: propertyId || 'prop-001',
        createdAt: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'res-004',
        guestName: 'Ana Costa',
        guestEmail: 'ana.costa@email.com',
        checkIn: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        checkOut: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        guests: 2,
        status: 'pending' as const,
        channel: 'VRBO',
        totalAmount: 400.0,
        propertyId: propertyId || 'prop-001',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'res-005',
        guestName: 'Pedro Oliveira',
        guestEmail: 'pedro.oliveira@email.com',
        checkIn: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        checkOut: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        guests: 1,
        status: 'completed' as const,
        channel: 'Booking.com',
        totalAmount: 525.0,
        propertyId: propertyId || 'prop-001',
        createdAt: new Date(
          Date.now() - 28 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ]

    // Filter by propertyId if specified
    let filteredReservations = mockReservations
    if (propertyId) {
      filteredReservations = mockReservations.filter(
        (res) => res.propertyId === propertyId
      )
    }

    return NextResponse.json(filteredReservations)
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = getHostexConfig()
    const hostex = new HostexClient(config.credentials)

    const body = await request.json()
    const { action, reservationId, ...data } = body

    switch (action) {
      case 'create':
        const newReservation = await hostex.createReservation(data)
        return NextResponse.json(newReservation)

      case 'update':
        if (!reservationId) {
          return NextResponse.json(
            { error: 'Reservation ID is required for update' },
            { status: 400 }
          )
        }
        const updatedReservation = await hostex.updateReservation(
          reservationId,
          data
        )
        return NextResponse.json(updatedReservation)

      case 'cancel':
        if (!reservationId) {
          return NextResponse.json(
            { error: 'Reservation ID is required for cancellation' },
            { status: 400 }
          )
        }
        const cancelledReservation = await hostex.cancelReservation(
          reservationId,
          data.reason
        )
        return NextResponse.json(cancelledReservation)

      case 'confirm':
        // If API doesn't support confirm explicitly, treat as update with status
        const confirmed = await hostex.updateReservation(reservationId, {
          status: 'confirmed',
        } as any)
        return NextResponse.json(confirmed)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing reservation action:', error)
    return NextResponse.json(
      { error: 'Failed to process reservation action' },
      { status: 500 }
    )
  }
}
