'use client'

import { useDashboardMetrics } from '@/hooks/hostex/useDashboardMetrics'
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  LinkIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'gray'
  loading?: boolean
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
  loading,
}: MetricCardProps) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="mb-1 text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="flex items-center space-x-2">
              <ArrowPathIcon className="h-5 w-5 animate-spin text-gray-400" />
              <span className="text-gray-400">Carregando...</span>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
              )}
            </>
          )}
        </div>
        <div className={`rounded-lg border p-3 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

export function MetricsWidget() {
  const { metrics, loading, error, refreshMetrics } = useDashboardMetrics()

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center space-x-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Erro ao carregar métricas
            </h3>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button
              onClick={refreshMetrics}
              className="mt-2 text-sm text-red-700 underline hover:text-red-800"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Métricas Principais
        </h2>
        <button
          onClick={refreshMetrics}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          <ArrowPathIcon
            className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
          />
          <span>Atualizar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Receita Total"
          value={
            metrics?.totalRevenue
              ? `R$ ${metrics.totalRevenue.toLocaleString('pt-BR')}`
              : 'R$ 0,00'
          }
          subtitle="Todas as propriedades"
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          color="green"
          loading={loading}
        />

        <MetricCard
          title="Taxa de Ocupação"
          value={
            metrics?.averageOccupancy
              ? `${metrics.averageOccupancy.toFixed(1)}%`
              : '0.0%'
          }
          subtitle="Média geral"
          icon={<ChartBarIcon className="h-6 w-6" />}
          color="blue"
          loading={loading}
        />

        <MetricCard
          title="Total de Reservas"
          value={metrics?.totalReservations || 0}
          subtitle="Ativas e confirmadas"
          icon={<CalendarIcon className="h-6 w-6" />}
          color="purple"
          loading={loading}
        />

        <MetricCard
          title="Canais Conectados"
          value={metrics?.connectedChannels || 0}
          subtitle="Airbnb, Booking, etc."
          icon={<LinkIcon className="h-6 w-6" />}
          color="orange"
          loading={loading}
        />

        <MetricCard
          title="Propriedades Ativas"
          value={metrics?.activeProperties || 0}
          subtitle="Em operação"
          icon={<BuildingOfficeIcon className="h-6 w-6" />}
          color="gray"
          loading={loading}
        />

        <MetricCard
          title="Conflitos Pendentes"
          value={metrics?.pendingConflicts || 0}
          subtitle="Requer atenção"
          icon={<ExclamationTriangleIcon className="h-6 w-6" />}
          color={
            metrics?.pendingConflicts && metrics.pendingConflicts > 0
              ? 'red'
              : 'gray'
          }
          loading={loading}
        />
      </div>

      {metrics?.lastSync && (
        <div className="text-center text-xs text-gray-500">
          Última sincronização:{' '}
          {new Date(metrics.lastSync).toLocaleString('pt-BR')}
        </div>
      )}
    </div>
  )
}
