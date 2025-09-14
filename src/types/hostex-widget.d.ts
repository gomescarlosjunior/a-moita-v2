declare global {
  interface Window {
    hostexWidget?: any
  }

  namespace JSX {
    interface IntrinsicElements {
      'hostex-search-widget': any
      'hostex-search-result-widget': any
      'hostex-booking-widget': any
    }
  }
}

export {}
