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
  XMarkIcon
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
      setError(err instanceof Error ? err.message : 'Erro ao carregar propriedade')
    } finally {
      setLoading(false)
    }
  }

  const fetchReservations = async () => {
    try {
      const response = await fetch(`/api/hostex/reservations?propertyId=${propertyId}`)
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
          propertyId: property.id
        })
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
      case 'active': return 'Ativa'
      case 'inactive': return 'Inativa'
      case 'maintenance': return 'Manutenção'
      default: return status
    }
  }

  const getReservationStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando propriedade...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erro ao carregar propriedade
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {property.address}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(property.status)}`}>
                    {getStatusLabel(property.status)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informações da Propriedade
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <BuildingOfficeIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Tipo</p>
                  <p className="font-semibold text-gray-900 capitalize">{property.type}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-2xl font-bold text-gray-900">{property.bedrooms}</span>
                  <p className="text-sm text-gray-600">Quartos</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-2xl font-bold text-gray-900">{property.bathrooms}</span>
                  <p className="text-sm text-gray-600">Banheiros</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <UsersIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Max Hóspedes</p>
                  <p className="font-semibold text-gray-900">{property.maxGuests}</p>
                </div>
              </div>
            </motion.div>

            {/* Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Métricas de Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {property.metrics.revenue.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600">Receita Total</p>
                </div>
                <div className="text-center">
                  <ChartBarIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {property.metrics.occupancyRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Taxa de Ocupação</p>
                </div>
                <div className="text-center">
                  <CalendarIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {property.metrics.totalReservations}
                  </p>
                  <p className="text-sm text-gray-600">Total de Reservas</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
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
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Reservas Recentes
                </h2>
                <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  Ver todas →
                </button>
              </div>
              {reservations.length > 0 ? (
                <div className="space-y-4">
                  {reservations.slice(0, 5).map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{reservation.guestName}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(reservation.checkIn).toLocaleDateString('pt-BR')} - {new Date(reservation.checkOut).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-500">{reservation.channel}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getReservationStatusColor(reservation.status)}`}>
                          {reservation.status}
                        </span>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          R$ {reservation.totalAmount.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
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
                    <div key={channel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <LinkIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{channel.name}</p>
                          {channel.lastSync && (
                            <p className="text-xs text-gray-500">
                              Sync: {new Date(channel.lastSync).toLocaleString('pt-BR')}
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
                  <div className="text-center py-6">
                    <LinkIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Nenhum canal conectado</p>
                    <button
                      onClick={() => setShowConnectModal(true)}
                      className="mt-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
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
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ações Rápidas
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center p-3 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Ver Calendário
                </button>
                <button className="w-full flex items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  Atualizar Preços
                </button>
                <button className="w-full flex items-center justify-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Sincronizar Tudo
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Connect Channel Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
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
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="font-medium text-gray-900">Airbnb</div>
                <div className="text-sm text-gray-600">Conectar com Airbnb</div>
              </button>
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="font-medium text-gray-900">Booking.com</div>
                <div className="text-sm text-gray-600">Conectar com Booking.com</div>
              </button>
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
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
