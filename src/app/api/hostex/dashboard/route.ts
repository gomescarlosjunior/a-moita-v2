import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Hostex API not available in current plan - return mock data
    const metrics = {
      totalRevenue: 0,
      averageOccupancy: 0,
      totalReservations: 0,
      connectedChannels: 0,
      activeProperties: 1,
      pendingConflicts: 0,
      lastSync: new Date().toISOString(),
    }
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error getting dashboard metrics:', error)
    return NextResponse.json(
      {
        error: 'Dashboard metrics unavailable',
        details: 'Hostex API not included in current plan',
      },
      { status: 503 }
    )
  }
}
