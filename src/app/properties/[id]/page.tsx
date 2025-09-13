'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  UsersIcon,
  ArrowPathIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface Property {
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

interface Reservation {
  id: string
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  guests: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  channel: string
  totalAmount: number
}

export default function PropertyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConnectModal, setShowConnectModal] = useState(false)

  useEffect(() => {
    fetchPropertyDetails()
    fetchReservations()
  }, [propertyId])

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/hostex/properties/${propertyId}`)
      if (!response.ok) {
        throw new Error('Propriedade não encontrada')
      }
      const data = await response.json()
      setProperty(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar propriedade'
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchReservations = async () => {
    try {
      const response = await fetch(
        `/api/hostex/reservations?propertyId=${propertyId}`
      )
      if (response.ok) {
        const data = await response.json()
        setReservations(data)
      }
    } catch (err) {
      console.error('Error fetching reservations:', err)
    }
  }

  const handleSync = async () => {
    if (!property) return

    setSyncing(true)
    try {
      const response = await fetch('/api/hostex/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          propertyId: property.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Falha na sincronização')
      }

      await fetchPropertyDetails()
      await fetchReservations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na sincronização')
    } finally {
      setSyncing(false)
    }
  }

  const getStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: Property['status']) => {
    switch (status) {
      case 'active':
        return 'Ativa'
      case 'inactive':
        return 'Inativa'
      case 'maintenance':
        return 'Manutenção'
      default:
        return status
    }
  }

  const getReservationStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <ArrowPathIcon className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-400" />
          <p className="text-gray-600">Carregando propriedade...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Erro ao carregar propriedade
          </h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-md bg-teal-600 px-4 py-2 text-white hover:bg-teal-700"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {property.name}
                </h1>
                <div className="mt-1 flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="mr-1 h-4 w-4" />
                    {property.address}
                  </div>
                  <span
                    className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(property.status)}`}
                  >
                    {getStatusLabel(property.status)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center space-x-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
              >
                <ArrowPathIcon
                  className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`}
                />
                <span>{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Property Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Informações da Propriedade
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-gray-50 p-4 text-center">
                  <BuildingOfficeIcon className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600">Tipo</p>
                  <p className="font-semibold capitalize text-gray-900">
                    {property.type}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 text-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {property.bedrooms}
                  </span>
                  <p className="text-sm text-gray-600">Quartos</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 text-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {property.bathrooms}
                  </span>
                  <p className="text-sm text-gray-600">Banheiros</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 text-center">
                  <UsersIcon className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600">Max Hóspedes</p>
                  <p className="font-semibold text-gray-900">
                    {property.maxGuests}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Métricas de Performance
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="text-center">
                  <CurrencyDollarIcon className="mx-auto mb-2 h-8 w-8 text-green-500" />
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {property.metrics.revenue.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600">Receita Total</p>
                </div>
                <div className="text-center">
                  <ChartBarIcon className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                  <p className="text-2xl font-bold text-gray-900">
                    {property.metrics.occupancyRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Taxa de Ocupação</p>
                </div>
                <div className="text-center">
                  <CalendarIcon className="mx-auto mb-2 h-8 w-8 text-purple-500" />
                  <p className="text-2xl font-bold text-gray-900">
                    {property.metrics.totalReservations}
                  </p>
                  <p className="text-sm text-gray-600">Total de Reservas</p>
                </div>
                <div className="text-center">
                  <div className="mb-2 flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {property.metrics.averageRating.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">Avaliação Média</p>
                </div>
              </div>
            </motion.div>

            {/* Recent Reservations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Reservas Recentes
                </h2>
                <button className="text-sm font-medium text-teal-600 hover:text-teal-700">
                  Ver todas →
                </button>
              </div>
              {reservations.length > 0 ? (
                <div className="space-y-4">
                  {reservations.slice(0, 5).map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {reservation.guestName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(reservation.checkIn).toLocaleDateString(
                            'pt-BR'
                          )}{' '}
                          -{' '}
                          {new Date(reservation.checkOut).toLocaleDateString(
                            'pt-BR'
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {reservation.channel}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getReservationStatusColor(reservation.status)}`}
                        >
                          {reservation.status}
                        </span>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          R$ {reservation.totalAmount.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CalendarIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-600">Nenhuma reserva encontrada</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Connected Channels */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Canais Conectados
                </h3>
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="p-2 text-teal-600 hover:text-teal-700"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3">
                {property.connectedChannels.length > 0 ? (
                  property.connectedChannels.map((channel) => (
                    <div
                      key={channel.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <LinkIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {channel.name}
                          </p>
                          {channel.lastSync && (
                            <p className="text-xs text-gray-500">
                              Sync:{' '}
                              {new Date(channel.lastSync).toLocaleString(
                                'pt-BR'
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {channel.status === 'connected' && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        )}
                        {channel.status === 'error' && (
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center">
                    <LinkIcon className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Nenhum canal conectado
                    </p>
                    <button
                      onClick={() => setShowConnectModal(true)}
                      className="mt-2 text-sm font-medium text-teal-600 hover:text-teal-700"
                    >
                      Conectar canal
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Ações Rápidas
              </h3>
              <div className="space-y-3">
                <button className="flex w-full items-center justify-center rounded-lg bg-teal-50 p-3 text-teal-700 transition-colors hover:bg-teal-100">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Ver Calendário
                </button>
                <button className="flex w-full items-center justify-center rounded-lg bg-blue-50 p-3 text-blue-700 transition-colors hover:bg-blue-100">
                  <CurrencyDollarIcon className="mr-2 h-5 w-5" />
                  Atualizar Preços
                </button>
                <button className="flex w-full items-center justify-center rounded-lg bg-purple-50 p-3 text-purple-700 transition-colors hover:bg-purple-100">
                  <ArrowPathIcon className="mr-2 h-5 w-5" />
                  Sincronizar Tudo
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Connect Channel Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Conectar Canal
              </h3>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <button className="w-full rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50">
                <div className="font-medium text-gray-900">Airbnb</div>
                <div className="text-sm text-gray-600">Conectar com Airbnb</div>
              </button>
              <button className="w-full rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50">
                <div className="font-medium text-gray-900">Booking.com</div>
                <div className="text-sm text-gray-600">
                  Conectar com Booking.com
                </div>
              </button>
              <button className="w-full rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50">
                <div className="font-medium text-gray-900">VRBO</div>
                <div className="text-sm text-gray-600">Conectar com VRBO</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
