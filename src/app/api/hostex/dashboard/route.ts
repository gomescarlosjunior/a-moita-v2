import { NextRequest, NextResponse } from 'next/server'
import { hostexIntegration } from '@/lib/hostex'

export async function GET(request: NextRequest) {
  try {
    const metrics = await hostexIntegration.getDashboardMetrics()
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error getting dashboard metrics:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get dashboard metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
