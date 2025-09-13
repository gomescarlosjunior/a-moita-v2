'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Property {
  id: string
  name: string
  address: string
  type: 'apartment' | 'house' | 'villa' | 'cabin' | 'other'
  bedrooms: number
  bathrooms: number
  maxGuests: number
  status: 'active' | 'inactive' | 'maintenance'
  channels: string[]
  connectedChannels: Array<{
    id: string
    name: string
    status: 'connected' | 'disconnected' | 'error'
    lastSync?: string
  }>
  metrics: {
    revenue: number
    occupancyRate: number
    totalReservations: number
    averageRating: number
  }
  createdAt: string
  updatedAt: string
}

export interface UsePropertiesReturn {
  properties: Property[]
  loading: boolean
  error: string | null
  refreshProperties: () => Promise<void>
  syncProperty: (propertyId: string) => Promise<void>
  connectChannel: (
    propertyId: string,
    channelId: string,
    credentials: Record<string, any>
  ) => Promise<void>
  disconnectChannel: (propertyId: string, channelId: string) => Promise<void>
}

export function useProperties(): UsePropertiesReturn {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/hostex/properties')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.details || `HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      setProperties(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar propriedades'
      setError(errorMessage)
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshProperties = useCallback(async () => {
    await fetchProperties()
  }, [fetchProperties])

  const syncProperty = useCallback(
    async (propertyId: string) => {
      try {
        const response = await fetch('/api/hostex/properties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'sync',
            propertyId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.details || 'Falha na sincronização')
        }

        // Refresh properties after sync
        await refreshProperties()
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro na sincronização'
        setError(errorMessage)
        throw err
      }
    },
    [refreshProperties]
  )

  const connectChannel = useCallback(
    async (
      propertyId: string,
      channelId: string,
      credentials: Record<string, any>
    ) => {
      try {
        const response = await fetch('/api/hostex/properties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'connect',
            propertyId,
            channelId,
            credentials,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.details || 'Falha ao conectar canal')
        }

        // Refresh properties after connection
        await refreshProperties()
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao conectar canal'
        setError(errorMessage)
        throw err
      }
    },
    [refreshProperties]
  )

  const disconnectChannel = useCallback(
    async (propertyId: string, channelId: string) => {
      try {
        const response = await fetch('/api/hostex/properties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'disconnect',
            propertyId,
            channelId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.details || 'Falha ao desconectar canal')
        }

        // Refresh properties after disconnection
        await refreshProperties()
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao desconectar canal'
        setError(errorMessage)
        throw err
      }
    },
    [refreshProperties]
  )

  // Initial load
  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (!loading) {
          refreshProperties()
        }
      },
      5 * 60 * 1000
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [loading, refreshProperties])

  return {
    properties,
    loading,
    error,
    refreshProperties,
    syncProperty,
    connectChannel,
    disconnectChannel,
  }
}
