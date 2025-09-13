'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { MetricsWidget } from '@/components/hostex/MetricsWidget'
import PropertiesWidget from '@/components/hostex/PropertiesWidget'
import Link from 'next/link'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: true },
  {
    name: 'Propriedades',
    href: '/properties',
    icon: BuildingOfficeIcon,
    current: false,
  },
  {
    name: 'Reservas',
    href: '/reservations',
    icon: CalendarIcon,
    current: false,
  },
  {
    name: 'Mensagens',
    href: '/messaging',
    icon: ChatBubbleLeftRightIcon,
    current: false,
  },
  { name: 'Relatórios', href: '/reports', icon: ChartBarIcon, current: false },
  { name: 'Configurações', href: '/settings', icon: CogIcon, current: false },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`relative z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2 shadow-xl">
              <div className="flex h-16 shrink-0 items-center">
                <h1 className="text-xl font-bold text-teal-600">A Moita</h1>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={classNames(
                              item.current
                                ? 'bg-teal-50 text-teal-600'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600',
                              'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                            )}
                          >
                            <item.icon
                              className={classNames(
                                item.current
                                  ? 'text-teal-600'
                                  : 'text-gray-400 group-hover:text-teal-600',
                                'h-6 w-6 shrink-0'
                              )}
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-teal-600">A Moita</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-teal-50 text-teal-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600',
                          'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            item.current
                              ? 'text-teal-600'
                              : 'text-gray-400 group-hover:text-teal-600',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>

              <div
                className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
                aria-hidden="true"
              />

              <div className="relative">
                <button
                  type="button"
                  className="-m-1.5 flex items-center p-1.5"
                >
                  <span className="sr-only">Open user menu</span>
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <span className="hidden lg:flex lg:items-center">
                    <span
                      className="ml-4 text-sm font-semibold leading-6 text-gray-900"
                      aria-hidden="true"
                    >
                      Max Silva
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {/* Welcome Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 p-6 text-white"
              >
                <h2 className="mb-2 text-2xl font-bold">
                  Bem-vindo de volta, Max! 👋
                </h2>
                <p className="text-teal-100">
                  Aqui está um resumo das suas propriedades e reservas hoje.
                </p>
              </motion.div>

              {/* Real-time Metrics */}
              <MetricsWidget />

              {/* Properties Management */}
              <PropertiesWidget />

              {/* Quick Actions */}
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/properties" className="block">
                  <div className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-8 w-8 text-teal-600" />
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Propriedades
                        </h3>
                        <p className="text-sm text-gray-600">
                          Gerenciar propriedades
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/reservations" className="block">
                  <div className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
                    <div className="flex items-center">
                      <CalendarIcon className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Reservas
                        </h3>
                        <p className="text-sm text-gray-600">
                          Ver todas as reservas
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/messaging" className="block">
                  <div className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
                    <div className="flex items-center">
                      <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Mensagens
                        </h3>
                        <p className="text-sm text-gray-600">
                          Comunicação com hóspedes
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/integration-test" className="block">
                  <div className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
                    <div className="flex items-center">
                      <Cog6ToothIcon className="h-8 w-8 text-gray-600" />
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Testes
                        </h3>
                        <p className="text-sm text-gray-600">
                          Testar integração
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Integration Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-lg border border-gray-200 bg-white p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Status da Integração
                  </h3>
                  <Link
                    href="/integration-test"
                    className="text-sm font-medium text-teal-600 hover:text-teal-700"
                  >
                    Executar Testes →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex items-center space-x-3 rounded-lg bg-green-50 p-3">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Hostex API
                      </p>
                      <p className="text-xs text-green-600">Conectado</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg bg-green-50 p-3">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Sincronização
                      </p>
                      <p className="text-xs text-green-600">Ativa</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg bg-green-50 p-3">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Webhooks
                      </p>
                      <p className="text-xs text-green-600">Funcionando</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
