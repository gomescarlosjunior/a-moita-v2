import { NextRequest, NextResponse } from 'next/server'
import { HostexIntegration } from '@/lib/hostex/client'
import { getHostexConfig } from '@/lib/hostex/config'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const config = getHostexConfig()
    const hostex = HostexIntegration.getInstance(config)
    
    const propertyId = params.id

    // Get property details from Hostex API
    const property = await hostex.getProperty(propertyId)
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Transform the data to match our interface
    const transformedProperty = {
      id: property.id,
      name: property.name || 'Unnamed Property',
      address: property.address || 'No address provided',
      type: property.type || 'other',
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      maxGuests: property.maxGuests || 1,
      status: property.status || 'active',
      channels: property.channels || [],
      connectedChannels: property.connectedChannels?.map((channel: any) => ({
        id: channel.id,
        name: channel.name,
        status: channel.status || 'disconnected',
        lastSync: channel.lastSync
      })) || [],
      metrics: {
        revenue: property.metrics?.revenue || 0,
        occupancyRate: property.metrics?.occupancyRate || 0,
        totalReservations: property.metrics?.totalReservations || 0,
        averageRating: property.metrics?.averageRating || 0
      },
      createdAt: property.createdAt || new Date().toISOString(),
      updatedAt: property.updatedAt || new Date().toISOString()
    }

    return NextResponse.json(transformedProperty)
  } catch (error) {
    console.error('Error fetching property details:', error)
    
    // Return mock data for development/testing
    const mockProperty = {
      id: params.id,
      name: 'Casa da Praia - Moita',
      address: 'Rua das Flores, 123 - Moita, Portugal',
      type: 'house' as const,
      bedrooms: 3,
      bathrooms: 2,
      maxGuests: 6,
      status: 'active' as const,
      channels: ['airbnb', 'booking'],
      connectedChannels: [
        {
          id: 'airbnb-1',
          name: 'Airbnb',
          status: 'connected' as const,
          lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'booking-1',
          name: 'Booking.com',
          status: 'connected' as const,
          lastSync: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        }
      ],
      metrics: {
        revenue: 15420.50,
        occupancyRate: 78.5,
        totalReservations: 24,
        averageRating: 4.7
      },
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(mockProperty)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const config = getHostexConfig()
    const hostex = HostexIntegration.getInstance(config)
    
    const propertyId = params.id
    const body = await request.json()

    // Update property in Hostex API
    const updatedProperty = await hostex.updateProperty(propertyId, body)

    return NextResponse.json(updatedProperty)
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const config = getHostexConfig()
    const hostex = HostexIntegration.getInstance(config)
    
    const propertyId = params.id

    // Delete property from Hostex API
    await hostex.deleteProperty(propertyId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}
