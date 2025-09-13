'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HOSTEX_WIDGET_ID } from '@/lib/hostex/constants'

export default function SearchResultsPage() {
  const [hostexLoaded, setHostexLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [searchParams, setSearchParams] = useState({
    checkin: '',
    checkout: '',
    guests: '1',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    const checkin =
      url.searchParams.get('checkin') || url.searchParams.get('check_in') || ''
    const checkout =
      url.searchParams.get('checkout') ||
      url.searchParams.get('check_out') ||
      ''
    const guests =
      url.searchParams.get('guests') || url.searchParams.get('adults') || '1'

    setSearchParams({ checkin, checkout, guests })
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const existingScript = document.querySelector(
      'script[src*="hostex-widget.js"]'
    )

    if (existingScript) {
      setHostexLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src =
      'https://hostex.io/app/assets/js/hostex-widget.js?version=20250910115612'
    script.type = 'module'
    script.async = true

    script.onload = () => {
      setHostexLoaded(true)
      setTimeout(() => {
        if (
          window.hostexWidget &&
          typeof window.hostexWidget.init === 'function'
        ) {
          window.hostexWidget.init()
        }
      }, 100)
    }

    script.onerror = () => {
      console.error('Failed to load Hostex widget script')
    }

    if (typeof document !== 'undefined') {
      document.head.appendChild(script)
    }

    return () => {
      // Don't remove script on unmount to avoid reload issues
    }
  }, [])

  useEffect(() => {
    if (hostexLoaded && mounted) {
      const timer = setTimeout(() => {
        if (typeof document === 'undefined' || typeof window === 'undefined')
          return
        const widgetContainer = document.getElementById(
          'hostex-search-results-container'
        )
        if (widgetContainer && (window as any).hostexWidget) {
          widgetContainer.innerHTML = `
            <hostex-search-result-widget 
              id="${HOSTEX_WIDGET_ID}"
              ${searchParams.checkin ? `checkin="${searchParams.checkin}"` : ''}
              ${searchParams.checkout ? `checkout="${searchParams.checkout}"` : ''}
              ${searchParams.guests ? `guests="${searchParams.guests}"` : ''}
            ></hostex-search-result-widget>
          `

          if (typeof (window as any).hostexWidget.init === 'function') {
            ;(window as any).hostexWidget.init()
          }
        }
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [hostexLoaded, mounted, searchParams])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative bg-teal-900">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/assets/backgrounds/waves-header.png"
            alt="Background waves"
            fill
            className="object-cover opacity-90"
            priority
          />
        </div>
        <nav className="relative z-10 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="inline-block">
                <Image
                  src="/assets/branding/logo-white.svg"
                  alt="A Moita"
                  width={144}
                  height={48}
                  className="h-8 w-auto md:h-10"
                  priority
                />
              </Link>

              <div className="hidden items-center space-x-6 md:flex lg:space-x-8">
                <Link
                  href="/"
                  className="text-base text-gray-100 transition-colors hover:text-gold-300 lg:text-lg"
                >
                  Início
                </Link>
                <Link
                  href="/#nossos-pilares"
                  className="text-base text-gray-100 transition-colors hover:text-gold-300 lg:text-lg"
                >
                  Sobre
                </Link>
                <Link
                  href="/#chales"
                  className="text-base text-gray-100 transition-colors hover:text-gold-300 lg:text-lg"
                >
                  Chalés
                </Link>
                <Link
                  href="/#contato"
                  className="text-base text-gray-100 transition-colors hover:text-gold-300 lg:text-lg"
                >
                  Contato
                </Link>
              </div>
            </div>
          </div>
        </nav>
        {/* Airbnb-like search bar at the top of results */}
        <div className="relative z-10 pb-4">
          <div className="container mx-auto px-4">
            <div className="results-search-wrapper mx-auto max-w-3xl">
              <style jsx>{`
                .results-search-wrapper {
                  position: relative;
                }
                .results-search-wrapper hostex-search-widget {
                  display: block;
                  width: 100%;
                  transform: scale(0.78);
                  transform-origin: top center;
                  /* Theme variables (Airbnb-like pill) */
                  --primary-bg-color: #f6f6f2;
                  --primary-color: var(--user-primary-color, #388087);
                  --site-btn-text-color: #f6f6f2;
                  --site-widget-bg-color: #f6f6f2;
                  --site-widget-border-color: #b3d5d9;
                  --site-widget-btn-bg-color: #ffffff;
                  --site-widget-btn-border-color: #ffffff;
                  --site-widget-btn-radius: 9999px;
                  --site-widget-btn-text-color: #0d2b24;
                  --site-widget-text-color: #0d2b24;
                  --site-widget-text-color-secondary: #728a8d;
                  --user-primary-color: #0d2b24;
                }
                /* Make the search button appear as a white pill with green icon */
                .results-search-wrapper :global(.search-button) {
                  background: #ffffff !important;
                  color: #0d2b24 !important;
                  border-radius: 9999px !important;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                }
                .results-search-wrapper :global(.search-button svg),
                .results-search-wrapper :global(.search-button path),
                .results-search-wrapper :global(.search-button i) {
                  color: #0d2b24 !important;
                  fill: #0d2b24 !important;
                }
                /* Calendar popovers on top */
                .results-search-wrapper :global(.calendar-container),
                .results-search-wrapper :global(.calendar-overlay),
                .results-search-wrapper :global(.date-picker-dropdown) {
                  z-index: 99999 !important;
                  position: relative !important;
                  pointer-events: auto !important;
                }
              `}</style>
              {mounted && hostexLoaded && (
                <hostex-search-widget
                  result-url="/search-results"
                  id={HOSTEX_WIDGET_ID}
                  style={{ width: '100%', display: 'block' }}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Search Summary */}
          {(searchParams.checkin ||
            searchParams.checkout ||
            searchParams.guests !== '1') && (
            <div className="mb-8 rounded-lg border border-teal-100 bg-teal-50 p-4">
              <h2 className="mb-2 text-lg font-semibold text-teal-900">
                Sua busca:
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-teal-800">
                {searchParams.checkin && (
                  <span>
                    Check-in:{' '}
                    {new Date(searchParams.checkin).toLocaleDateString('pt-BR')}
                  </span>
                )}
                {searchParams.checkout && (
                  <span>
                    Check-out:{' '}
                    {new Date(searchParams.checkout).toLocaleDateString(
                      'pt-BR'
                    )}
                  </span>
                )}
                {searchParams.guests !== '1' && (
                  <span>Hóspedes: {searchParams.guests}</span>
                )}
              </div>
            </div>
          )}

          {/* Search Results Widget Container */}
          <div className="search-results-container">
            <style jsx>{`
              .search-results-container {
                width: 100%;
                min-height: 600px;
              }
              #hostex-search-results-container {
                width: 100%;
                min-height: 600px;
              }
              #hostex-search-results-container hostex-search-result-widget {
                width: 100%;
                display: block;
                min-height: 600px;
              }
              /* Hostex theme variables for consistency */
              .search-results-container :global(hostex-search-result-widget) {
                --primary-bg-color: #f6f6f2;
                --primary-color: #0d2b24;
                --site-btn-text-color: #f6f6f2;
                --site-widget-bg-color: #ffffff;
                --site-widget-border-color: #e5e7eb;
                --site-widget-btn-bg-color: #0d2b24;
                --site-widget-btn-border-color: transparent;
                --site-widget-btn-radius: 8px;
                --site-widget-btn-text-color: #ffffff;
                --site-widget-text-color: #374151;
                --site-widget-text-color-secondary: #6b7280;
                --user-primary-color: #0d2b24;
              }
            `}</style>

            {mounted && hostexLoaded ? (
              <div id="hostex-search-results-container">
                <hostex-search-result-widget
                  id={HOSTEX_WIDGET_ID}
                  checkin={searchParams.checkin || ''}
                  checkout={searchParams.checkout || ''}
                  guests={searchParams.guests || '1'}
                />
              </div>
            ) : (
              <div
                className="loading-placeholder"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '600px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-teal-600"></div>
                  <p className="text-lg">Buscando disponibilidade...</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Carregando resultados para suas datas
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-teal-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <Image
                src="/assets/branding/logo-white.svg"
                alt="A Moita"
                width={144}
                height={48}
                className="mb-4 h-10 w-auto"
              />
              <p className="mb-4 text-gray-300">
                Conexão profunda com a natureza, simplicidade que acolhe e
                hospitalidade regenerativa no coração do Cerrado.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Navegação</h3>
              <div className="space-y-2 text-gray-300">
                <Link
                  href="/"
                  className="block transition-colors hover:text-white"
                >
                  Início
                </Link>
                <Link
                  href="/#nossos-pilares"
                  className="block transition-colors hover:text-white"
                >
                  Sobre
                </Link>
                <Link
                  href="/#chales"
                  className="block transition-colors hover:text-white"
                >
                  Chalés
                </Link>
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Contato</h3>
              <div className="space-y-2 text-gray-300">
                <p>Rio Capivari, Abadiânia-GO</p>
                <p>contato@amoita.com.br</p>
                <p>+55 (61) 99999-9999</p>
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Siga-nos</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  <span className="sr-only">Instagram</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323C6.001 8.198 7.152 7.708 8.449 7.708s2.448.49 3.323 1.416c.926.875 1.416 2.026 1.416 3.323s-.49 2.448-1.416 3.323c-.875.807-2.026 1.218-3.323 1.218zm7.718-9.092c-.49 0-.926-.184-1.297-.49-.49-.49-.49-1.297 0-1.787.49-.49 1.297-.49 1.787 0 .49.49.49 1.297 0 1.787-.371.306-.807.49-1.49.49z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-teal-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 A Moita. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
