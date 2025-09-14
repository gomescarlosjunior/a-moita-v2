'use client'

import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createPortal } from 'react-dom'
import { analytics } from '@/lib/analytics'
import { DayPicker, DateRange } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

interface GuestCounts {
  adults: number
  children: number
  babies: number
  pets: number
}

export default function ActiveReservationBar() {
  const [range, setRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState<GuestCounts>({
    adults: 1,
    children: 0,
    babies: 0,
    pets: 0,
  })
  const [openCalendar, setOpenCalendar] = useState(false)
  const [openGuests, setOpenGuests] = useState(false)
  const [mounted, setMounted] = useState(false)
  const barRef = useRef<HTMLDivElement | null>(null)
  const [calPos, setCalPos] = useState<{
    left: number
    top: number
    width: number
  }>({ left: 0, top: 0, width: 0 })
  const [guestPos, setGuestPos] = useState<{
    left: number
    top: number
    width: number
  }>({ left: 0, top: 0, width: 280 })
  const [monthsCount, setMonthsCount] = useState<number>(1)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on ESC key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenCalendar(false)
        setOpenGuests(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Disable background text selection while dropdowns are open
  useEffect(() => {
    const anyOpen = openCalendar || openGuests
    if (anyOpen) {
      document.body.classList.add('no-select')
    } else {
      document.body.classList.remove('no-select')
    }
    return () => document.body.classList.remove('no-select')
  }, [openCalendar, openGuests])

  // When opening the calendar, compute its viewport position and keep it aligned on resize/scroll
  useEffect(() => {
    const updatePos = () => {
      const el = barRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      // months: mobile 1, md+ 2
      const vw = window.innerWidth
      const nextMonths = vw >= 768 ? 2 : 1
      setMonthsCount(nextMonths)
      // Desired min width to fit 2 months comfortably
      const desiredMin = nextMonths === 2 ? 560 : Math.min(rect.width, 400)
      const width = Math.max(Math.min(rect.width, vw - 16), desiredMin)
      // Clamp within viewport (8px margin)
      const left = Math.min(Math.max(8, rect.left), Math.max(8, vw - width - 8))
      const top = rect.bottom + 8
      setCalPos({ left, top, width })
      // Guests panel (fixed ~280px)
      const gWidth = 280
      const gLeft = Math.min(
        Math.max(8, rect.right - gWidth),
        Math.max(8, vw - gWidth - 8)
      )
      setGuestPos({ left: gLeft, top, width: gWidth })
    }
    if (openCalendar) {
      updatePos()
      window.addEventListener('resize', updatePos)
      window.addEventListener('scroll', updatePos, true)
      return () => {
        window.removeEventListener('resize', updatePos)
        window.removeEventListener('scroll', updatePos, true)
      }
    }
  }, [openCalendar])

  // Keep guests panel aligned on open/resize as well
  useEffect(() => {
    const updateGuests = () => {
      const el = barRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vw = window.innerWidth
      const gWidth = 280
      const left = Math.min(
        Math.max(8, rect.right - gWidth),
        Math.max(8, vw - gWidth - 8)
      )
      const top = rect.bottom + 8
      setGuestPos({ left, top, width: gWidth })
    }
    if (openGuests) {
      updateGuests()
      window.addEventListener('resize', updateGuests)
      window.addEventListener('scroll', updateGuests, true)
      return () => {
        window.removeEventListener('resize', updateGuests)
        window.removeEventListener('scroll', updateGuests, true)
      }
    }
  }, [openGuests])

  const totalPeople = guests.adults + guests.children
  const maxGuests = 4

  const handleGuestChange = (type: keyof GuestCounts, increment: boolean) => {
    setGuests((prev) => {
      const newValue = increment ? prev[type] + 1 : Math.max(0, prev[type] - 1)
      if (type === 'adults' && newValue === 0) return prev
      const newGuests = { ...prev, [type]: newValue }
      const newTotal = newGuests.adults + newGuests.children
      if (newTotal > maxGuests) return prev
      return newGuests
    })
  }

  const handleSearch = () => {
    if (!range?.from || !range?.to || totalPeople === 0) return

    // Track search event
    analytics.trackSearch('property_search', {
      check_in: format(range.from, 'yyyy-MM-dd'),
      check_out: format(range.to, 'yyyy-MM-dd'),
      guests: totalPeople,
      adults: guests.adults,
      children: guests.children,
      babies: guests.babies,
      pets: guests.pets,
    })

    const searchParams = new URLSearchParams({
      check_in: format(range.from, 'yyyy-MM-dd'),
      check_out: format(range.to, 'yyyy-MM-dd'),
      adults: guests.adults.toString(),
      children: guests.children.toString(),
      babies: guests.babies.toString(),
      pets: guests.pets.toString(),
      guests: totalPeople.toString(),
    })

    window.location.href = `/chaleAOrigem?${searchParams.toString()}`
  }

  const isSearchDisabled = !range?.from || !range?.to || totalPeople === 0

  if (!mounted) return null

  return (
    <div
      ref={barRef}
      className="relative z-[200] mx-auto w-full max-w-[40.8rem]"
    >
      {/* ~15% menor que 48rem (max-w-3xl) */}
      {/* Global styles (must NOT be nested under other styled-jsx) */}
      <style jsx global>{`
        body.no-select * {
          user-select: none !important;
        }
        /* Calendar theming and responsiveness */
        .rdp-custom {
          --rdp-cell-size: 28px;
          --rdp-accent-color: #0d2b24;
          --rdp-background-color: #f0f7f4;
          --rdp-accent-color-dark: #0a1f1a;
          --rdp-background-color-dark: #0d2b24;
          --rdp-outline: 2px solid var(--rdp-accent-color);
          --rdp-outline-selected: 2px solid #0d2b24;
          margin: 0;
        }
        @media (min-width: 640px) {
          .rdp-custom {
            --rdp-cell-size: 30px;
          }
        }
        @media (min-width: 768px) {
          .rdp-custom {
            --rdp-cell-size: 32px;
          }
        }
        @media (min-width: 1024px) {
          .rdp-custom {
            --rdp-cell-size: 34px;
          }
        }
        .rdp-custom .rdp-day {
          height: var(--rdp-cell-size);
          width: var(--rdp-cell-size);
          border-radius: 50%;
        }
        /* Smaller labels and numbers */
        .rdp-custom .rdp-caption_label {
          font-size: 1rem;
        }
        @media (min-width: 768px) {
          .rdp-custom .rdp-caption_label {
            font-size: 1.05rem;
          }
        }
        .rdp-custom .rdp-button {
          font-size: 0.85rem;
        }
        @media (min-width: 768px) {
          .rdp-custom .rdp-button {
            font-size: 0.9rem;
          }
        }
        .rdp-custom .rdp-head_cell {
          font-size: 0.75rem;
        }
        .rdp-custom .rdp-day_selected,
        .rdp-custom .rdp-day_selected:focus-visible,
        .rdp-custom .rdp-day_selected:hover {
          background-color: #0d2b24 !important;
          color: #fff !important;
        }
        .rdp-custom .rdp-day_range_start,
        .rdp-custom .rdp-day_range_end {
          background-color: #0d2b24 !important;
          color: #fff !important;
        }
        .rdp-custom .rdp-day_range_middle {
          background: rgba(13, 43, 36, 0.1) !important;
          color: #0d2b24 !important;
        }
        .rdp-custom .rdp-nav_button {
          color: #0d2b24 !important;
        }
        .rdp-custom .rdp-nav_button:hover {
          background: rgba(13, 43, 36, 0.1) !important;
        }
        /* Force two months side-by-side on md+ */
        @media (min-width: 768px) {
          .rdp-custom .rdp-months {
            display: grid !important;
            grid-template-columns: repeat(2, auto) !important;
            gap: 1rem;
          }
        }
      `}</style>
      {/* Screen Overlay (Portal) */}
      {mounted &&
        (openCalendar || openGuests) &&
        createPortal(
          <div
            className="fixed inset-0 z-[205] bg-black/0"
            onClick={() => {
              setOpenCalendar(false)
              setOpenGuests(false)
            }}
          />,
          document.body
        )}
      {/* Main Search Bar - Pill Style */}
      <div className="flex items-center rounded-full bg-white px-3 py-1 shadow-lg ring-1 ring-black/5">
        {/* Check In */}
        <div className="relative flex-1">
          <button
            onClick={() => {
              analytics.trackCTAClick('open_calendar', 'reservation_bar')
              const next = !openCalendar
              setOpenCalendar(next)
              setOpenGuests(false)
            }}
            className="w-full rounded-l-full px-3 py-2 text-left transition-colors hover:bg-gray-50"
            aria-expanded={openCalendar}
          >
            <div>
              <p className="text-xs font-semibold" style={{ color: '#0d2b24' }}>
                Check in
              </p>
              <p className="text-xs text-gray-500">
                {range?.from
                  ? format(range.from!, "dd 'de' MMM", { locale: ptBR })
                  : 'Adicionar datas'}
              </p>
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="hidden h-6 w-px bg-gray-200 md:block" />

        {/* Check Out */}
        <div className="relative flex-1">
          <button
            onClick={() => {
              analytics.trackCTAClick('open_calendar', 'reservation_bar')
              const next = !openCalendar
              setOpenCalendar(next)
              setOpenGuests(false)
            }}
            className="w-full px-3 py-2 text-left transition-colors hover:bg-gray-50"
            aria-expanded={openCalendar}
          >
            <div>
              <p className="text-xs font-semibold" style={{ color: '#0d2b24' }}>
                Check out
              </p>
              <p className="text-xs text-gray-500">
                {range?.to
                  ? format(range.to!, "dd 'de' MMM", { locale: ptBR })
                  : 'Adicionar datas'}
              </p>
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="hidden h-6 w-px bg-gray-200 md:block" />

        {/* Guests */}
        <div className="relative flex-1">
          <button
            onClick={() => {
              analytics.trackCTAClick('open_guests', 'reservation_bar')
              setOpenGuests(!openGuests)
              setOpenCalendar(false)
            }}
            className="w-full rounded-r-full px-3 py-2 text-left transition-colors hover:bg-gray-50"
            aria-expanded={openGuests}
          >
            <div>
              <p className="text-xs font-semibold" style={{ color: '#0d2b24' }}>
                Hóspedes
              </p>
              <p className="text-xs text-gray-500">
                {totalPeople > 0
                  ? `${totalPeople} hóspedes${guests.babies ? ` · ${guests.babies} bebê(s)` : ''}${
                      guests.pets ? ` · ${guests.pets} pet(s)` : ''
                    }`
                  : 'Adicionar hóspedes'}
              </p>
            </div>
          </button>
        </div>

        {/* Search Button */}
        <button
          onClick={() => {
            analytics.trackCTAClick('reservar_button', 'reservation_bar')
            handleSearch()
          }}
          disabled={isSearchDisabled}
          className="ml-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition-colors disabled:bg-gray-300"
          style={{ backgroundColor: isSearchDisabled ? '#d1d5db' : '#0d2b24' }}
          onMouseEnter={(e) =>
            !isSearchDisabled &&
            (e.currentTarget.style.backgroundColor = '#0a1f1a')
          }
          onMouseLeave={(e) =>
            !isSearchDisabled &&
            (e.currentTarget.style.backgroundColor = '#0d2b24')
          }
          aria-label="Reservar"
        >
          Reservar
        </button>
      </div>
      {/* Calendar Dropdown (Portal) */}
      {mounted &&
        openCalendar &&
        createPortal(
          <div
            className="fixed z-[210] max-h-[75vh] overflow-auto rounded-xl bg-white p-2 shadow-2xl ring-1 ring-black/5 sm:p-3"
            style={{
              left: calPos.left,
              top: calPos.top,
              width: calPos.width,
              isolation: 'isolate',
            }}
          >
            <DayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={monthsCount}
              locale={ptBR}
              disabled={{ before: new Date() }}
              className="rdp-custom text-[13px] sm:text-sm"
              pagedNavigation={monthsCount === 2}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setOpenCalendar(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors"
                style={{ backgroundColor: '#0d2b24' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#0a1f1a')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = '#0d2b24')
                }
              >
                Fechar
              </button>
            </div>
          </div>,
          document.body
        )}
      {/* Guests Dropdown (Portal) */}
      {mounted &&
        openGuests &&
        createPortal(
          <div
            className="fixed z-[210] w-[280px] rounded-xl bg-white p-4 shadow-2xl ring-1 ring-black/5"
            style={{ left: guestPos.left, top: guestPos.top }}
          >
            <div className="space-y-3">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: '#0d2b24' }}
                  >
                    Adultos
                  </p>
                  <p className="text-xs text-gray-500">13 anos ou mais</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleGuestChange('adults', false)}
                    disabled={guests.adults <= 1}
                    className="rounded-full border p-1 transition-colors disabled:opacity-50"
                    style={{ borderColor: '#0d2b24', color: '#0d2b24' }}
                    onMouseEnter={(e) =>
                      !e.currentTarget.disabled &&
                      (e.currentTarget.style.backgroundColor = '#f0f9ff')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="w-6 text-center text-sm">
                    {guests.adults}
                  </span>
                  <button
                    onClick={() => handleGuestChange('adults', true)}
                    disabled={totalPeople >= maxGuests}
                    className="rounded-full border p-1 transition-colors disabled:opacity-50"
                    style={{ borderColor: '#0d2b24', color: '#0d2b24' }}
                    onMouseEnter={(e) =>
                      !e.currentTarget.disabled &&
                      (e.currentTarget.style.backgroundColor = '#f0f9ff')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: '#0d2b24' }}
                  >
                    Crianças
                  </p>
                  <p className="text-xs text-gray-500">2-12 anos</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleGuestChange('children', false)}
                    disabled={guests.children <= 0}
                    className="rounded-full border p-1 transition-colors disabled:opacity-50"
                    style={{ borderColor: '#0d2b24', color: '#0d2b24' }}
                    onMouseEnter={(e) =>
                      !e.currentTarget.disabled &&
                      (e.currentTarget.style.backgroundColor = '#f0f9ff')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="w-6 text-center text-sm">
                    {guests.children}
                  </span>
                  <button
                    onClick={() => handleGuestChange('children', true)}
                    disabled={totalPeople >= maxGuests}
                    className="rounded-full border p-1 transition-colors disabled:opacity-50"
                    style={{ borderColor: '#0d2b24', color: '#0d2b24' }}
                    onMouseEnter={(e) =>
                      !e.currentTarget.disabled &&
                      (e.currentTarget.style.backgroundColor = '#f0f9ff')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Babies */}
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: '#0d2b24' }}
                  >
                    Bebês
                  </p>
                  <p className="text-xs text-gray-500">Menos de 2 anos</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleGuestChange('babies', false)}
                    disabled={guests.babies <= 0}
                    className="rounded-full border p-1 transition-colors disabled:opacity-50"
                    style={{ borderColor: '#0d2b24', color: '#0d2b24' }}
                    onMouseEnter={(e) =>
                      !e.currentTarget.disabled &&
                      (e.currentTarget.style.backgroundColor = '#f0f9ff')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="w-6 text-center text-sm">
                    {guests.babies}
                  </span>
                  <button
                    onClick={() => handleGuestChange('babies', true)}
                    className="rounded-full border p-1 transition-colors disabled:opacity-50"
                    style={{ borderColor: '#0d2b24', color: '#0d2b24' }}
                    onMouseEnter={(e) =>
                      !e.currentTarget.disabled &&
                      (e.currentTarget.style.backgroundColor = '#f0f9ff')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Pets */}
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: '#0d2b24' }}
                  >
                    Pets
                  </p>
                  <p className="text-xs text-gray-500">Animais de estimação</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleGuestChange('pets', false)}
                    disabled={guests.pets <= 0}
                    className="rounded-full border p-1 transition-colors disabled:opacity-50"
                    style={{ borderColor: '#0d2b24', color: '#0d2b24' }}
                    onMouseEnter={(e) =>
                      !e.currentTarget.disabled &&
                      (e.currentTarget.style.backgroundColor = '#f0f9ff')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="w-6 text-center text-sm">{guests.pets}</span>
                  <button
                    onClick={() => handleGuestChange('pets', true)}
                    className="rounded-full border p-1 transition-colors disabled:opacity-50"
                    style={{ borderColor: '#0d2b24', color: '#0d2b24' }}
                    onMouseEnter={(e) =>
                      !e.currentTarget.disabled &&
                      (e.currentTarget.style.backgroundColor = '#f0f9ff')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setOpenGuests(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors"
                style={{ backgroundColor: '#0d2b24' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#0a1f1a')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = '#0d2b24')
                }
              >
                Fechar
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
