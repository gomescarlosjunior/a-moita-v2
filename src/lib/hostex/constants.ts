// Centralized Hostex constants for the whole app
// This avoids divergence of IDs across pages and prepares for multiple properties

export type HostexPropertyKey = 'origem' | string

// Core Hostex account configuration
export const HOSTEX_HOST_ID = '103279'
export const HOSTEX_WIDGET_HOST = 'https://w.hostexbooking.site'

// Precomputed Base64 for {"host_id":"103279","widget_host":"https://w.hostexbooking.site"}
export const HOSTEX_WIDGET_ID =
  'eyJob3N0X2lkIjoiMTAzMjc5Iiwid2lkZ2V0X2hvc3QiOiJodHRwczovL3cuaG9zdGV4Ym9va2luZy5zaXRlIn0='

// Map of property listings managed in Hostex
// Add new properties here as we expand
export const HOSTEX_LISTINGS: Record<
  HostexPropertyKey,
  { listingId: string; slug: string; title: string; resultUrl: string }
> = {
  origem: {
    listingId: '113010',
    slug: 'chaleAOrigem',
    title: 'Chalé A Origem',
    resultUrl: '/chaleAOrigem',
  },
}

// Helper to resolve a listing by key, throws if missing to avoid silent bugs
export function getListing(key: HostexPropertyKey) {
  const item = HOSTEX_LISTINGS[key]
  if (!item) {
    throw new Error(`HOSTEX_LISTINGS missing entry for key: ${key}`)
  }
  return item
}

// Build booking URL on Hostex site for a given property
export function buildBookingUrl(listingKey: HostexPropertyKey) {
  const { listingId } = getListing(listingKey)
  return `${HOSTEX_WIDGET_HOST}/${HOSTEX_HOST_ID}`
}

// Get all result URLs for search-result-widget configuration
export function getAllResultUrls(): string {
  return Object.values(HOSTEX_LISTINGS)
    .map((listing) => listing.resultUrl)
    .join(',')
}
