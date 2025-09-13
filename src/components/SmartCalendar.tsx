'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

interface SmartCalendarProps {
  onDateSelect?: (checkin: Date | null, checkout: Date | null) => void
  onBookingReady?: (checkin: Date, checkout: Date) => void
  className?: string
}

interface DateRange {
  checkin: Date | null
  checkout: Date | null
}

export default function SmartCalendar({
  onDateSelect,
  onBookingReady,
  className = '',
}: SmartCalendarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dateRange, setDateRange] = useState<DateRange>({
    checkin: null,
    checkout: null,
  })
  const [isBookingReady, setIsBookingReady] = useState(false)
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (dateRange.checkin && dateRange.checkout) {
      setIsBookingReady(true)
      onDateSelect?.(dateRange.checkin, dateRange.checkout)

      // Auto-close after selection
      setTimeout(() => {
        setIsOpen(false)
      }, 800)
    } else {
      setIsBookingReady(false)
    }
  }, [dateRange, onDateSelect])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const handleDateClick = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date < today) return

    if (!dateRange.checkin || (dateRange.checkin && dateRange.checkout)) {
      // First selection or reset
      setDateRange({ checkin: date, checkout: null })
    } else if (date > dateRange.checkin) {
      // Second selection - checkout
      setDateRange((prev) => ({ ...prev, checkout: date }))
    } else {
      // Date is before checkin, reset
      setDateRange({ checkin: date, checkout: null })
    }
  }

  const isDateInRange = (date: Date) => {
    if (!dateRange.checkin) return false

    const endDate =
      hoverDate && !dateRange.checkout && hoverDate > dateRange.checkin
        ? hoverDate
        : dateRange.checkout

    if (!endDate) return false

    return date >= dateRange.checkin && date <= endDate
  }

  const isDateSelected = (date: Date) => {
    return (
      (dateRange.checkin && date.getTime() === dateRange.checkin.getTime()) ||
      (dateRange.checkout && date.getTime() === dateRange.checkout.getTime())
    )
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const handleBookingClick = () => {
    if (dateRange.checkin && dateRange.checkout) {
      onBookingReady?.(dateRange.checkin, dateRange.checkout)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  return (
    <div className={`smart-calendar ${className}`} ref={calendarRef}>
      <style jsx global>{`
        :root {
          --font-primary: 'Cormorant Garamond', serif;
          --accent: #d9c086;
          --accent-dark: #0d2b24;
          --bg-primary: #f5f5f0;
          --text-primary: #0d2b24;
          --transition-ease: cubic-bezier(0.4, 0, 0.2, 1);
        }

        .smart-calendar {
          position: relative;
          font-family: var(--font-primary);
        }

        .calendar-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 12px;
          align-items: center;
        }

        .date-input {
          position: relative;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s var(--transition-ease);
          font-family: var(--font-primary);
          font-size: 16px;
          color: var(--text-primary);
        }

        .date-input:hover {
          border-color: var(--accent);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(217, 192, 134, 0.15);
        }

        .date-input.filled {
          border-color: var(--accent);
          background: rgba(217, 192, 134, 0.05);
        }

        .date-input.filled::after {
          content: '✓';
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--accent-dark);
          font-weight: bold;
        }

        .date-input .label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .date-input .value {
          font-size: 16px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .date-input .placeholder {
          color: #9ca3af;
          font-style: italic;
        }

        .booking-button {
          background: linear-gradient(135deg, var(--accent), #c5a572);
          color: var(--accent-dark);
          border: none;
          border-radius: 12px;
          padding: 18px 24px;
          font-family: var(--font-primary);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s var(--transition-ease);
          position: relative;
          overflow: hidden;
        }

        .booking-button:disabled {
          background: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .booking-button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(217, 192, 134, 0.4);
        }

        .booking-button.ready {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(217, 192, 134, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(217, 192, 134, 0);
          }
        }

        .calendar-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          overflow: hidden;
          margin-top: 8px;
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          background: var(--accent-dark);
          color: white;
        }

        .calendar-nav {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .calendar-nav:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.1);
        }

        .calendar-title {
          font-size: 20px;
          font-weight: 600;
          font-family: var(--font-primary);
        }

        .calendar-grid {
          padding: 20px;
        }

        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 12px;
        }

        .weekday {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          padding: 8px 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }

        .day-cell {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s var(--transition-ease);
          position: relative;
        }

        .day-cell:hover:not(.disabled) {
          transform: scale(1.05);
          background: var(--accent);
          color: var(--accent-dark);
        }

        .day-cell.disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }

        .day-cell.selected {
          background: var(--accent);
          color: var(--accent-dark);
          font-weight: 700;
        }

        .day-cell.in-range {
          background: rgba(217, 192, 134, 0.3);
          color: var(--accent-dark);
        }

        .day-cell.range-start {
          background: var(--accent);
          color: var(--accent-dark);
          font-weight: 700;
        }

        .day-cell.range-end {
          background: var(--accent);
          color: var(--accent-dark);
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .calendar-dropdown {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: 0;
            border-radius: 0;
            z-index: 9999;
          }

          .calendar-inputs {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .booking-button {
            width: 100%;
            padding: 20px;
            font-size: 18px;
          }
        }
      `}</style>

      <div className="calendar-inputs">
        <div
          className={`date-input ${dateRange.checkin ? 'filled' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          role="button"
          tabIndex={0}
          aria-label="Selecionar data de check-in"
        >
          <div className="label">Check-in</div>
          <div className={dateRange.checkin ? 'value' : 'placeholder'}>
            {dateRange.checkin
              ? formatDate(dateRange.checkin)
              : 'Selecione a data'}
          </div>
        </div>

        <div
          className={`date-input ${dateRange.checkout ? 'filled' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          role="button"
          tabIndex={0}
          aria-label="Selecionar data de check-out"
        >
          <div className="label">Check-out</div>
          <div className={dateRange.checkout ? 'value' : 'placeholder'}>
            {dateRange.checkout
              ? formatDate(dateRange.checkout)
              : 'Selecione a data'}
          </div>
        </div>

        <button
          className={`booking-button ${isBookingReady ? 'ready' : ''}`}
          disabled={!isBookingReady}
          onClick={handleBookingClick}
          aria-label="Verificar preços e disponibilidade"
        >
          {isBookingReady ? 'Verificar Preços' : 'Selecione as datas'}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="calendar-dropdown"
            initial={{
              maxHeight: 0,
              opacity: 0,
              y: -20,
            }}
            animate={{
              maxHeight: 600,
              opacity: 1,
              y: 0,
            }}
            exit={{
              maxHeight: 0,
              opacity: 0,
              y: -20,
            }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <div className="calendar-header">
              <button
                className="calendar-nav"
                onClick={() => navigateMonth('prev')}
                aria-label="Mês anterior"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>

              <div className="calendar-title">
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>

              <button
                className="calendar-nav"
                onClick={() => navigateMonth('next')}
                aria-label="Próximo mês"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="calendar-grid">
              <div className="weekdays">
                {weekdays.map((day) => (
                  <div key={day} className="weekday">
                    {day}
                  </div>
                ))}
              </div>

              <motion.div className="days-grid">
                {getDaysInMonth(currentMonth).map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="day-cell" />
                  }

                  const isDisabled = isDateDisabled(date)
                  const isSelected = isDateSelected(date)
                  const inRange = isDateInRange(date)
                  const isRangeStart =
                    dateRange.checkin &&
                    date.getTime() === dateRange.checkin.getTime()
                  const isRangeEnd =
                    dateRange.checkout &&
                    date.getTime() === dateRange.checkout.getTime()

                  return (
                    <motion.div
                      key={date.toISOString()}
                      className={`day-cell ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${inRange ? 'in-range' : ''} ${isRangeStart ? 'range-start' : ''} ${isRangeEnd ? 'range-end' : ''}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: index * 0.01,
                        duration: 0.2,
                        ease: 'easeOut',
                      }}
                      onClick={() => !isDisabled && handleDateClick(date)}
                      onMouseEnter={() => !isDisabled && setHoverDate(date)}
                      onMouseLeave={() => setHoverDate(null)}
                      role="button"
                      tabIndex={isDisabled ? -1 : 0}
                      aria-label={`${date.getDate()} de ${months[date.getMonth()]}`}
                      aria-disabled={isDisabled}
                    >
                      {date.getDate()}
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
