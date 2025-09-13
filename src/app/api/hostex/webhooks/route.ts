import { NextRequest, NextResponse } from 'next/server'
import { hostexIntegration } from '@/lib/hostex'
import { auditLogger } from '@/lib/hostex/config'
import crypto from 'crypto'

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-hostex-signature')
    const webhookSecret = process.env.HOSTEX_WEBHOOK_SECRET
    const apiKeyHeader = request.headers.get('x-api-key')
    const envAccessToken = process.env.HOSTEX_ACCESS_TOKEN
    const url = new URL(request.url)
    const accessTokenQuery = url.searchParams.get('access_token')

    const payload = await request.text()

    // Verification strategy:
    // 1) If we have both a webhook secret and signature, prefer HMAC verification
    // 2) Otherwise, fall back to validating x-api-key header equals HOSTEX_ACCESS_TOKEN
    // 3) If headers cannot be set by the provider, allow access_token in the query string
    const canUseHmac = Boolean(webhookSecret && signature)
    let verified = false

    if (canUseHmac) {
      verified = verifyWebhookSignature(payload, signature!, webhookSecret!)
      if (!verified) {
        auditLogger.log('WEBHOOK_SIGNATURE_INVALID', {
          hasSignature: !!signature,
          payloadLength: payload.length,
        })
      }
    } else if (
      apiKeyHeader &&
      envAccessToken &&
      apiKeyHeader === envAccessToken
    ) {
      verified = true
    } else if (
      accessTokenQuery &&
      envAccessToken &&
      accessTokenQuery === envAccessToken
    ) {
      verified = true
    }

    if (!verified) {
      return NextResponse.json(
        { error: 'Unauthorized webhook' },
        { status: 401 }
      )
    }

    const data = JSON.parse(payload)
    const { event, data: eventData } = data

    auditLogger.log('WEBHOOK_RECEIVED', {
      event,
      reservationId: eventData?.id,
      propertyId: eventData?.propertyId,
    })

    // Handle different webhook events
    switch (event) {
      case 'reservation.created':
        await hostexIntegration.handleReservationCreated(eventData)
        break

      case 'reservation.updated':
        await hostexIntegration.handleReservationUpdated(eventData)
        break

      case 'reservation.cancelled':
        await hostexIntegration.handleReservationCancelled(eventData)
        break

      case 'availability.updated':
        // Trigger calendar sync for the affected property
        if (eventData?.propertyId) {
          await hostexIntegration.syncProperty(eventData.propertyId)
        }
        break

      case 'channel.connected':
        auditLogger.log('CHANNEL_CONNECTED_WEBHOOK', {
          propertyId: eventData?.propertyId,
          channelId: eventData?.channelId,
        })
        break

      case 'channel.disconnected':
        auditLogger.log('CHANNEL_DISCONNECTED_WEBHOOK', {
          propertyId: eventData?.propertyId,
          channelId: eventData?.channelId,
        })
        break

      default:
        console.warn(`Unhandled webhook event: ${event}`)
        auditLogger.log('WEBHOOK_UNHANDLED', { event })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    auditLogger.log('WEBHOOK_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
