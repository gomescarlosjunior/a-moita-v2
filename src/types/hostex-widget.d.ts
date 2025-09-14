import type * as React from 'react'

declare global {
  interface Window {
    hostexWidget?: {
      init?: () => void
    }
  }

  namespace JSX {
    interface IntrinsicElements {
      'hostex-search-widget': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >
      'hostex-search-result-widget': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >
      'hostex-booking-widget': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >
    }
  }
}

export {}
