// Google Analytics 4 and GTM event tracking utilities
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  custom_parameters?: Record<string, any>
}

// Track custom events to GA4
export const trackEvent = (event: AnalyticsEvent) => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
    console.log('Analytics Event (dev):', event)
    return
  }

  if (window.gtag) {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters,
    })
  }

  // Also push to dataLayer for GTM
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'custom_event',
      event_action: event.action,
      event_category: event.category,
      event_label: event.label,
      event_value: event.value,
      ...event.custom_parameters,
    })
  }
}

// Predefined event tracking functions
export const analytics = {
  // CTA and button clicks
  trackCTAClick: (ctaName: string, location: string) => {
    trackEvent({
      action: 'cta_click',
      category: 'engagement',
      label: ctaName,
      custom_parameters: {
        cta_location: location,
        page_path: window.location.pathname,
      },
    })
  },

  // Reservation flow events
  trackReservationStart: (propertyName: string) => {
    trackEvent({
      action: 'reservation_start',
      category: 'conversion',
      label: propertyName,
      custom_parameters: {
        property_name: propertyName,
        step: 'start',
      },
    })
  },

  trackReservationStep: (step: string, propertyName: string) => {
    trackEvent({
      action: 'reservation_step',
      category: 'conversion',
      label: `${propertyName}_${step}`,
      custom_parameters: {
        property_name: propertyName,
        step: step,
      },
    })
  },

  // Form interactions
  trackFormStart: (formName: string) => {
    trackEvent({
      action: 'form_start',
      category: 'engagement',
      label: formName,
    })
  },

  trackFormSubmit: (formName: string, success: boolean = true) => {
    trackEvent({
      action: success ? 'form_submit' : 'form_error',
      category: 'conversion',
      label: formName,
      custom_parameters: {
        form_success: success,
      },
    })
  },

  // Navigation and engagement
  trackNavigation: (destination: string, source: string) => {
    trackEvent({
      action: 'navigation',
      category: 'engagement',
      label: destination,
      custom_parameters: {
        navigation_source: source,
        destination_page: destination,
      },
    })
  },

  trackScroll: (percentage: number) => {
    trackEvent({
      action: 'scroll',
      category: 'engagement',
      label: `${percentage}%`,
      value: percentage,
      custom_parameters: {
        scroll_percentage: percentage,
      },
    })
  },

  // Property-specific events
  trackPropertyView: (propertyName: string, source?: string) => {
    trackEvent({
      action: 'property_view',
      category: 'engagement',
      label: propertyName,
      custom_parameters: {
        property_name: propertyName,
        view_source: source || 'direct',
      },
    })
  },

  trackPropertyInterest: (propertyName: string, interactionType: string) => {
    trackEvent({
      action: 'property_interest',
      category: 'engagement',
      label: propertyName,
      custom_parameters: {
        property_name: propertyName,
        interaction_type: interactionType, // 'gallery', 'amenities', 'location', etc.
      },
    })
  },

  // Search and filtering
  trackSearch: (searchTerm: string, filters?: Record<string, any>) => {
    trackEvent({
      action: 'search',
      category: 'engagement',
      label: searchTerm,
      custom_parameters: {
        search_term: searchTerm,
        search_filters: filters,
      },
    })
  },

  // Outbound links
  trackOutboundLink: (url: string, linkText: string) => {
    trackEvent({
      action: 'outbound_link',
      category: 'engagement',
      label: url,
      custom_parameters: {
        link_url: url,
        link_text: linkText,
      },
    })
  },

  // File downloads
  trackDownload: (fileName: string, fileType: string) => {
    trackEvent({
      action: 'download',
      category: 'engagement',
      label: fileName,
      custom_parameters: {
        file_name: fileName,
        file_type: fileType,
      },
    })
  },

  // Error tracking
  trackError: (
    errorType: string,
    errorMessage: string,
    errorLocation?: string
  ) => {
    trackEvent({
      action: 'error',
      category: 'technical',
      label: errorType,
      custom_parameters: {
        error_message: errorMessage,
        error_location: errorLocation || window.location.pathname,
      },
    })
  },
}

// Page view tracking (handled automatically by GA4, but can be called manually for SPA navigation)
export const trackPageView = (path: string, title?: string) => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
    console.log('Page View (dev):', { path, title })
    return
  }

  if (window.gtag) {
    window.gtag('config', 'G-3C73MX0NKB', {
      page_path: path,
      page_title: title || document.title,
    })
  }
}

// Initialize scroll tracking
export const initScrollTracking = () => {
  if (typeof window === 'undefined') return

  let scrollThresholds = [25, 50, 75, 90]
  let trackedThresholds: number[] = []

  const handleScroll = () => {
    const scrollPercent = Math.round(
      (window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight)) *
        100
    )

    scrollThresholds.forEach((threshold) => {
      if (
        scrollPercent >= threshold &&
        !trackedThresholds.includes(threshold)
      ) {
        trackedThresholds.push(threshold)
        analytics.trackScroll(threshold)
      }
    })
  }

  window.addEventListener('scroll', handleScroll, { passive: true })

  // Cleanup function
  return () => window.removeEventListener('scroll', handleScroll)
}
