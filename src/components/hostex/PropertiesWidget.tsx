'use client'

import { useProperties, Property } from '@/hooks/hostex/useProperties'
import { 
  BuildingOfficeIcon,
  MapPinIcon,
  UsersIcon,
  ArrowPathIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PropertyCardProps {
  property: Property
  onSync: (propertyId: string) => Promise<void>
  onViewDetails: (propertyId: string) => void
}

function PropertyCard({ property, onSync, onViewDetails }: PropertyCardProps) {
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      await onSync(property.id)
    } catch (error) {
      console.error('Sync failed:', error)
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(property.status)}`}>
              {getStatusLabel(property.status)}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {property.address}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{property.bedrooms} quartos</span>
            <span>{property.bathrooms} banheiros</span>
            <div className="flex items-center">
              <UsersIcon className="h-4 w-4 mr-1" />
              {property.maxGuests} hóspedes
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Receita</p>
          <p className="text-lg font-semibold text-gray-900">
            R$ {property.metrics.revenue.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Ocupação</p>
          <p className="text-lg font-semibold text-gray-900">
            {property.metrics.occupancyRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Connected Channels */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Canais Conectados</p>
        <div className="flex flex-wrap gap-2">
          {property.connectedChannels.length > 0 ? (
            property.connectedChannels.map((channel) => (
              <div
                key={channel.id}
                className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-full border ${
                  channel.status === 'connected'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : channel.status === 'error'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <LinkIcon className="h-3 w-3" />
                <span>{channel.name}</span>
                {channel.status === 'connected' && <CheckCircleIcon className="h-3 w-3" />}
                {channel.status === 'error' && <ExclamationTriangleIcon className="h-3 w-3" />}
              </div>
            ))
          ) : (
            <span className="text-sm text-gray-500">Nenhum canal conectado</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={() => onViewDetails(property.id)}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <EyeIcon className="h-4 w-4" />
          <span>Ver Detalhes</span>
        </button>
        
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
        </button>
      </div>
    </motion.div>
  )
}

export default function PropertiesWidget() {
  const router = useRouter()
  const { properties, loading, error, refreshProperties, syncProperty } = useProperties()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Propriedades ({properties.length})
        </h2>
        <button
          onClick={refreshProperties}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {loading && properties.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-16 bg-gray-100 rounded"></div>
                <div className="h-16 bg-gray-100 rounded"></div>
              </div>
              <div className="h-8 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {property.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(property.status)}`}>
                      {getStatusLabel(property.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{property.address}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{property.bedrooms}</p>
                      <p className="text-xs text-gray-600">Quartos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{property.bathrooms}</p>
                      <p className="text-xs text-gray-600">Banheiros</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{property.maxGuests}</p>
                      <p className="text-xs text-gray-600">Hóspedes</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>Canais: {property.connectedChannels.length}</span>
                    <span>Ocupação: {property.metrics.occupancyRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push(`/properties/${property.id}`)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-md hover:bg-teal-100 transition-colors"
                >
                  Ver Detalhes
                </button>
                <button
                  onClick={() => syncProperty(property.id)}
                  disabled={loading}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma propriedade encontrada
          </h3>
          <p className="text-gray-600 mb-4">
            Conecte sua conta Hostex para ver suas propriedades aqui.
          </p>
          <button
            onClick={refreshProperties}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
          >
            Verificar Novamente
          </button>
        </div>
      )}
    </div>
  )
}
