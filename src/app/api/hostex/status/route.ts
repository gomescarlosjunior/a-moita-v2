import { NextRequest, NextResponse } from 'next/server'
import { hostexIntegration } from '@/lib/hostex'

export async function GET(request: NextRequest) {
  try {
    const status = await hostexIntegration.getStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error('Error getting Hostex status:', error)
    return NextResponse.json(
      {
        error: 'Failed to get integration status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
