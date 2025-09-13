import { NextRequest, NextResponse } from 'next/server'
import { hostexIntegration } from '@/lib/hostex'

export async function GET(request: NextRequest) {
  try {
    const properties = await hostexIntegration.getProperties()
    return NextResponse.json(properties)
  } catch (error) {
    console.error('Error getting properties:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get properties',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, propertyId, channelId, credentials } = body

    switch (action) {
      case 'sync':
        if (!propertyId) {
          return NextResponse.json(
            { error: 'Property ID is required for sync action' },
            { status: 400 }
          )
        }
        const syncResult = await hostexIntegration.syncProperty(propertyId)
        return NextResponse.json(syncResult)

      case 'syncAll':
        const syncAllResults = await hostexIntegration.syncAllProperties()
        return NextResponse.json(syncAllResults)

      case 'connectChannel':
        if (!propertyId || !channelId || !credentials) {
          return NextResponse.json(
            { error: 'Property ID, channel ID, and credentials are required' },
            { status: 400 }
          )
        }
        await hostexIntegration.connectChannel(propertyId, channelId, credentials)
        return NextResponse.json({ success: true })

      case 'disconnectChannel':
        if (!propertyId || !channelId) {
          return NextResponse.json(
            { error: 'Property ID and channel ID are required' },
            { status: 400 }
          )
        }
        await hostexIntegration.disconnectChannel(propertyId, channelId)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in properties API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
