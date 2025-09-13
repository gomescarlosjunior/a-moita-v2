'use client'

import { useState, useEffect, useCallback } from 'react'

export interface DashboardMetrics {
  totalRevenue: number
  averageOccupancy: number
  totalReservations: number
  connectedChannels: number
  activeProperties: number
  pendingConflicts: number
  lastSync: string
}

export interface UseDashboardMetricsReturn {
  metrics: DashboardMetrics | null
  loading: boolean
  error: string | null
  refreshMetrics: () => Promise<void>
}

export function useDashboardMetrics(): UseDashboardMetricsReturn {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/hostex/dashboard')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.details || `HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      setMetrics(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar métricas'
      setError(errorMessage)
      console.error('Error fetching dashboard metrics:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshMetrics = useCallback(async () => {
    await fetchMetrics()
  }, [fetchMetrics])

  // Initial load
  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  // Auto-refresh every 2 minutes for real-time metrics
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (!loading) {
          refreshMetrics()
        }
      },
      2 * 60 * 1000
    ) // 2 minutes

    return () => clearInterval(interval)
  }, [loading, refreshMetrics])

  return {
    metrics,
    loading,
    error,
    refreshMetrics,
  }
}
