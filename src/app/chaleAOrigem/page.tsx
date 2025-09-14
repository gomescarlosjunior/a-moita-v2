'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  HOSTEX_WIDGET_ID,
  getListing,
  buildBookingUrl,
} from '@/lib/hostex/constants'

// Resolve listing for this property (A Origem)
const ORIGEM_LISTING = getListing('origem')

export default function ChaleAOrigemPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [hostexLoaded, setHostexLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [bookingParams, setBookingParams] = useState({
    checkin: '',
    checkout: '',
    guests: '1',
  })

  const images = [
    '/assets/gallery/origem/01.png',
    '/assets/gallery/origem/02.png',
    '/assets/gallery/origem/03.png',
    '/assets/gallery/origem/04.png',
  ]

  useEffect(() => {
    // Mark as mounted to avoid SSR rendering of client-only parts
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

    setBookingParams({ checkin, checkout, guests })
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
      // The script should persist across navigation
    }
  }, [])

  const handleBookingClick = () => {
    const bookingUrl = buildBookingUrl('origem')
    window.open(bookingUrl, '_blank', 'width=800,height=600')
  }

  const handleMapClick = () => {
    const mapUrl = 'https://maps.app.goo.gl/sc86nBWqpmRsiL4u7'

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )

    if (isMobile) {
      const userChoice = window.confirm(
        'Abrir localização no:\n\nOK = Google Maps\nCancelar = Escolher app'
      )

      if (userChoice) {
        window.open(mapUrl, '_blank')
      } else {
        const modal = document.createElement('div')
        modal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        `

        modal.innerHTML = `
          <div style="background: white; border-radius: 12px; padding: 24px; max-width: 300px; width: 100%;">
            <h3 style="margin: 0 0 16px 0; text-align: center; color: #0D2B24;">Abrir no:</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <button onclick="window.open('${mapUrl}', '_blank'); document.body.removeChild(this.closest('div').parentElement)" 
                style="padding: 12px; border: 1px solid #0D2B24; border-radius: 8px; background: white; color: #0D2B24; font-weight: 500;">
                Google Maps
              </button>
              <button onclick="window.open('https://maps.apple.com/?q=-15.9578,-48.1234', '_blank'); document.body.removeChild(this.closest('div').parentElement)" 
                style="padding: 12px; border: 1px solid #0D2B24; border-radius: 8px; background: white; color: #0D2B24; font-weight: 500;">
                Apple Maps
              </button>
              <button onclick="window.open('waze://?q=-15.9578,-48.1234', '_blank'); document.body.removeChild(this.closest('div').parentElement)" 
                style="padding: 12px; border: 1px solid #0D2B24; border-radius: 8px; background: white; color: #0D2B24; font-weight: 500;">
                Waze
              </button>
              <button onclick="document.body.removeChild(this.closest('div').parentElement)" 
                style="padding: 12px; border: none; border-radius: 8px; background: #f3f4f6; color: #6b7280; font-weight: 500; margin-top: 8px;">
                Cancelar
              </button>
            </div>
          </div>
        `

        document.body.appendChild(modal)
      }
    } else {
      window.open(mapUrl, '_blank')
    }
  }

  useEffect(() => {
    if (hostexLoaded && mounted) {
      const timer = setTimeout(() => {
        if (typeof document === 'undefined' || typeof window === 'undefined')
          return

        // Initialize only the booking widget on the property page
        const widgetContainer = document.getElementById(
          'hostex-widget-container'
        )
        if (widgetContainer && (window as any).hostexWidget) {
          widgetContainer.innerHTML = `
            <hostex-booking-widget 
              listing-id="${ORIGEM_LISTING.listingId}"
              id="${HOSTEX_WIDGET_ID}"
              ${bookingParams.checkin ? `checkin="${bookingParams.checkin}"` : ''}
              ${bookingParams.checkout ? `checkout="${bookingParams.checkout}"` : ''}
              ${bookingParams.guests ? `guests="${bookingParams.guests}"` : ''}
            ></hostex-booking-widget>
          `
        }

        // Initialize widgets (guard against undefined)
        const hw = (window as any).hostexWidget
        if (hw && typeof hw.init === 'function') {
          hw.init()
        }
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [hostexLoaded, mounted, bookingParams])

  return (
    <div className="min-h-screen bg-white">
      {/* Header - EXACTLY the same as homepage structure/classes */}
      <header className="relative bg-teal-800">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/assets/backgrounds/bg-waves.png"
            alt="Ondas de fundo"
            fill
            className="object-cover opacity-10"
            priority
          />
        </div>
        <nav className="relative z-10 py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <Link className="inline-block" href="/">
                <Image
                  src="/assets/branding/logo-white.svg"
                  alt="A Moita"
                  width={144}
                  height={48}
                  className="h-10 w-auto md:h-12"
                  priority
                />
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden items-center space-x-6 md:flex lg:space-x-8">
                <a
                  href="#"
                  className="text-base text-gray-100 transition-colors hover:text-gold-300 lg:text-lg"
                >
                  Início
                </a>
                <a
                  href="#nossos-pilares"
                  className="text-base text-gray-100 transition-colors hover:text-gold-300 lg:text-lg"
                >
                  Sobre
                </a>
                <a
                  href="#chales"
                  className="text-base text-gray-100 transition-colors hover:text-gold-300 lg:text-lg"
                >
                  Chalés
                </a>
                {/* Search is shown in the hero section below, removed from header for clarity */}
                <a
                  href="#"
                  onClick={handleBookingClick}
                  className="rounded-full bg-gold-300 px-4 py-2 text-sm font-medium text-teal-900 transition-colors hover:bg-gold-400 lg:px-6 lg:text-base"
                >
                  Reservar
                </a>
              </div>

              {/* Mobile menu button */}
              <button
                className="-mr-2 p-2 text-gray-100 md:hidden"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileNavOpen}
              >
                {mobileNavOpen ? (
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Mobile Navigation */}
            <div
              className={`transition-all duration-300 ease-in-out md:hidden ${
                mobileNavOpen
                  ? 'max-h-96 opacity-100'
                  : 'max-h-0 overflow-hidden opacity-0'
              }`}
            >
              <div className="mt-4 space-y-2 rounded-lg bg-teal-800/95 px-4 pb-4 pt-2 shadow-lg backdrop-blur-sm">
                <a
                  href="#"
                  className="block rounded-md px-4 py-3 text-base font-medium text-gray-100 transition-colors hover:bg-teal-700/30"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Início
                </a>
                <a
                  href="#nossos-pilares"
                  className="block rounded-md px-4 py-3 text-base font-medium text-gray-100 transition-colors hover:bg-teal-700/30"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Sobre
                </a>
                <a
                  href="#chales"
                  className="block rounded-md px-4 py-3 text-base font-medium text-gray-100 transition-colors hover:bg-teal-700/30"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Chalés
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handleBookingClick()
                    setMobileNavOpen(false)
                  }}
                  className="mt-2 block w-full rounded-full bg-gold-300 px-6 py-2 text-center font-medium text-teal-900 transition-colors hover:bg-gold-400"
                >
                  Reservar
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pb-12">
        {/* Photo Gallery Section */}
        <section className="relative">
          <div className="container mx-auto px-4 py-6">
            {/* Mobile Gallery */}
            <div className="md:hidden">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src={images[selectedImage]}
                  alt={`Chalé A Origem - Foto ${selectedImage + 1}`}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`h-2 w-2 rounded-full ${
                        index === selectedImage ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Gallery */}
            <div className="hidden md:block">
              <div className="grid grid-cols-4 gap-2 overflow-hidden rounded-xl">
                <div className="col-span-2 row-span-2">
                  <div className="relative aspect-square">
                    <Image
                      src={images[0]}
                      alt="Chalé A Origem - Principal"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
                {images.slice(1).map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={image}
                      alt={`Chalé A Origem - Foto ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowAllPhotos(true)}
                className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Mostrar todas as fotos
              </button>
            </div>
          </div>
        </section>

        {/* Property Details */}
        <section className="border-b border-gray-200">
          <div className="container mx-auto px-4 py-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left Column - Property Info */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h1 className="mb-2 text-2xl font-semibold text-gray-900 md:text-3xl">
                    Chalé A Origem
                  </h1>
                  <p className="text-gray-600">
                    4 hóspedes · 2 quartos · 2 camas · 1 banheiro
                  </p>
                </div>

                <div className="mb-8 border-b border-gray-200 pb-8">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                      <svg
                        className="h-6 w-6 text-teal-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Casa inteira</p>
                      <p className="text-sm text-gray-600">
                        Você terá o chalé só para você
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-8 border-b border-gray-200 pb-8">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">
                    Sobre este espaço
                  </h2>
                  <p className="leading-relaxed text-gray-700">
                    O Chalé A Origem oferece uma experiência única de conexão
                    com a natureza do Cerrado. Localizado em uma área de
                    preservação ambiental, o espaço foi projetado para
                    proporcionar conforto e tranquilidade, mantendo a harmonia
                    com o ambiente natural ao redor.
                  </p>
                  <br />
                  <p className="leading-relaxed text-gray-700">
                    Com arquitetura sustentável e materiais locais, o chalé
                    oferece todas as comodidades necessárias para uma estadia
                    memorável, incluindo cozinha completa, área de descanso e
                    vista privilegiada para a vegetação nativa.
                  </p>
                </div>

                {/* Amenities */}
                <div className="mb-8 border-b border-gray-200 pb-8">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">
                    O que este lugar oferece
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex items-center space-x-3">
                      <svg
                        className="h-5 w-5 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                        />
                      </svg>
                      <span className="text-gray-700">Wi-Fi</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg
                        className="h-5 w-5 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      <span className="text-gray-700">Cozinha</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg
                        className="h-5 w-5 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-gray-700">
                        Estacionamento gratuito
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg
                        className="h-5 w-5 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span className="text-gray-700">Natureza preservada</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg
                        className="h-5 w-5 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2-2 4-4m6 4l-4 4m6-4l-4-4"
                        />
                      </svg>
                      <span className="text-gray-700">
                        Limpeza profissional
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg
                        className="h-5 w-5 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                        />
                      </svg>
                      <span className="text-gray-700">
                        Vista para o Cerrado
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Booking Widget */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <div className="space-y-6">
                    {/* Hostex Booking Widget */}
                    <div className="hostex-booking-container mb-6">
                      <style jsx>{`
                        .hostex-booking-container {
                          width: 100%;
                          min-height: 400px;
                          border: 1px solid #e5e7eb;
                          border-radius: 12px;
                          padding: 16px;
                          background: white;
                        }
                        #hostex-widget-container {
                          width: 100%;
                          min-height: 400px;
                        }
                        #hostex-widget-container hostex-booking-widget {
                          width: 100%;
                          display: block;
                          min-height: 400px;
                        }
                      `}</style>

                      {mounted && hostexLoaded ? (
                        <div id="hostex-widget-container">
                          <hostex-booking-widget
                            listing-id={ORIGEM_LISTING.listingId}
                            id={HOSTEX_WIDGET_ID}
                            checkin={bookingParams.checkin || ''}
                            checkout={bookingParams.checkout || ''}
                            guests={bookingParams.guests || '1'}
                          />
                        </div>
                      ) : (
                        <div
                          className="loading-placeholder"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '400px',
                            background: '#f9fafb',
                            borderRadius: '8px',
                            color: '#6b7280',
                          }}
                        >
                          <div className="text-center">
                            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600"></div>
                            <p>Carregando calendário...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Removido: CTA externo de reserva. Toda a ação de reserva fica dentro do widget Hostex. */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews + Map side-by-side (responsive) */}
        <section className="border-t border-gray-200">
          <div className="container mx-auto px-4 py-8">
            {(() => {
              const reviews = [
                {
                  name: 'Maria',
                  date: 'Setembro 2024',
                  initial: 'M',
                  text: 'Experiência incrível! O chalé é exatamente como nas fotos e a conexão com a natureza é única. Recomendo para quem busca tranquilidade e contato com o Cerrado.',
                },
                {
                  name: 'João',
                  date: 'Agosto 2024',
                  initial: 'J',
                  text: 'Local perfeito para descansar e se reconectar. A hospitalidade é excepcional e o ambiente é muito bem cuidado. Voltaremos com certeza!',
                },
              ]
              const lastTwo = reviews.slice(-2)
              return (
                <div className="grid gap-8 md:grid-cols-5">
                  {/* Left: Reviews (2 últimas) */}
                  <div className="md:col-span-2">
                    <div className="mb-4 flex items-center space-x-3">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Avaliações
                      </h2>
                      <div className="flex items-center space-x-1">
                        <svg
                          className="h-5 w-5 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-medium text-gray-900">4.9</span>
                        <span className="text-gray-600">(12 avaliações)</span>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      {lastTwo.map((r, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-gray-200 p-5"
                        >
                          <div className="mb-3 flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                              <span className="text-sm font-medium text-teal-600">
                                {r.initial}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {r.name}
                              </p>
                              <p className="text-sm text-gray-600">{r.date}</p>
                            </div>
                          </div>
                          <p className="text-gray-700">“{r.text}”</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Map */}
                  <div className="md:col-span-3">
                    <h2 className="mb-1 text-xl font-semibold text-gray-900">
                      Onde você estará
                    </h2>
                    <p className="mb-4 text-gray-600">
                      A Moita | Refúgio Natural em Abadiânia-GO, Fazenda Lages
                      do Capivari – BR-414, KM 22 – Chácara 62 – Posse
                      d&apos;Abadia, Abadiânia - GO, 72940-000
                    </p>
                    <div className="overflow-hidden rounded-2xl border border-gray-200">
                      <div className="relative h-[260px] w-full sm:h-[300px] md:h-[360px] lg:h-[400px]">
                        <iframe
                          title="Mapa - A Moita | Refúgio Natural"
                          className="absolute inset-0 h-full w-full"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          src={
                            // Force a marker using Plus Code and tighten zoom for clarity
                            'https://www.google.com/maps?&q=' +
                            encodeURIComponent('V4VF+XC, Abadiânia, Goiás') +
                            '&markers=' +
                            encodeURIComponent('V4VF+XC, Abadiânia, Goiás') +
                            '&z=17&hl=pt-BR&output=embed'
                          }
                        />
                        {/* Always-visible pin overlay (does not block interactions) */}
                        <div
                          aria-hidden
                          className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.45))',
                          }}
                        >
                          <svg
                            width="36"
                            height="36"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z"
                              fill="#d90429"
                            />
                            <circle cx="12" cy="9" r="3" fill="#ffffff" />
                          </svg>
                        </div>
                      </div>
                      <div className="px-4 pb-4 text-sm text-teal-700">
                        <a
                          href={
                            'https://www.google.com/maps/search/?api=1&query=' +
                            encodeURIComponent('V4VF+XC, Abadiânia, Goiás')
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block font-medium hover:underline"
                        >
                          Ver no Google Maps (abrir em nova aba)
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </section>
      </main>

      {/* Footer - identical to homepage */}
      <footer
        className="relative py-12 lg:py-16"
        style={{ backgroundColor: '#f3efe8' }}
      >
        <Image
          className="absolute bottom-0 left-0"
          src="/assets/backgrounds/waves-footer.png"
          alt=""
          width={200}
          height={200}
          priority
        />
        <div className="container relative mx-auto px-4">
          <div className="mb-12 flex flex-col justify-between lg:flex-row">
            <div className="mb-8 lg:mb-0">
              <Link className="mb-6 inline-block" href="/">
                <Image
                  src="/assets/branding/logo.svg"
                  alt="A Moita"
                  width={120}
                  height={40}
                />
              </Link>
              <div className="mt-4 flex space-x-4">
                <a
                  href="https://www.instagram.com/moitanativa"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="h-6 w-6 text-teal-900 transition-colors hover:text-lime-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.415-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.415-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-1.281.22-2.33.678-3.21a5.5 5.5 0 013.21-3.21c.88-.457 1.929-.678 3.21-.678h.63c1.429 0 1.784.013 2.808.06.102.005.203.011.303.017v2.198h-1.22c-1.323 0-1.747.06-2.32.246a3.28 3.28 0 00-1.8 1.8c-.185.573-.245.997-.245 2.32v1.47c0 1.323.06 1.747.245 2.32.42 1.3 1.52 2.4 2.82 2.82.573.185.997.245 2.32.245h1.47c1.323 0 1.747-.06 2.32-.245a3.28 3.28 0 001.8-1.8c.185-.573.245-.997.245-2.32v-1.47c0-1.323-.06-1.747-.245-2.32a3.28 3.28 0 00-1.8-1.8c-.573-.185-.997-.245-2.32-.245h-1.1v-2.22c.1-.006.2-.012.303-.017 1.024-.047 1.379-.06 3.808-.06zM12 8.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm0 5.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@moitanativa"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="h-6 w-6 text-teal-900 transition-colors hover:text-lime-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.43.27-.83.63-1.01 1.07-.36.88-.32 1.83-.3 2.76.1 1.09.81 2.16 1.83 2.5 1.2.4 2.62-.1 3.31-1.08.23-.33.43-.69.48-1.09.1-.74.16-1.47.17-2.21.14-1.24-.06-2.7-.26-3.7.81.56 1.73.95 2.6 1.44.45.25.94.51 1.35.85.21.18.45.32.7.44.1.05.2.1.3.14.1.03.2.07.31.08.1.02.2.03.3.03.1 0 .2-.01.3-.03.1-.01.2-.05.31-.08.1-.04.2-.09.3-.14.25-.11.49-.26.7-.44.41-.34.9-.6 1.35-.85.87-.49 1.79-.88 2.6-1.44v-4.64c-1.63.1-3.26.05-4.89.04-.01 1.17.03 2.35-.01 3.52-.56-.38-1.23-.67-1.89-.9-1.1-.39-2.26-.57-3.43-.7-.12-.02-.24-.02-.36-.02-1.23 0-2.46.11-3.66.36-1.48.31-2.92.91-4.2 1.76-1.26.84-2.27 1.99-2.91 3.32-.64 1.32-.9 2.79-.85 4.27.1 2.85 1.5 5.53 3.87 7.09 1.37.9 2.99 1.42 4.64 1.5 1.06.05 2.12-.03 3.16-.29 1.56-.39 3-1.14 4.2-2.2 1.2-1.06 2.03-2.45 2.4-3.99.2-.82.27-1.66.28-2.5.03-1.87.02-3.74.02-5.61 0-1.23.01-2.47 0-3.7.01-1.65 0-3.3 0-4.95z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                  Navegação
                </h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link
                      href="/"
                      className="text-base text-gray-600 transition-colors hover:text-lime-600"
                    >
                      Início
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#nossos-pilares"
                      className="text-base text-gray-600 transition-colors hover:text-lime-600"
                    >
                      Sobre
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#chales"
                      className="text-base text-gray-600 transition-colors hover:text-lime-600"
                    >
                      Chalés
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={handleBookingClick}
                      className="text-base text-gray-600 transition-colors hover:text-lime-600"
                    >
                      Reservar
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                Contato
              </h3>
              <address className="mt-4 text-base not-italic text-gray-600">
                <p>Rio Capivari, Abadiânia-GO</p>
                <a
                  href="mailto:contato@moitanativa.com.br"
                  className="mt-2 block transition-colors hover:text-lime-600"
                >
                  contato@moitanativa.com.br
                </a>
              </address>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-center text-base text-gray-500">
              &copy; 2025 A Moita. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Photo Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowAllPhotos(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="grid grid-cols-2 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={image}
                    alt={`Chalé A Origem - Foto ${index + 1}`}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
