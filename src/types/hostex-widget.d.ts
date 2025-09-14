import type * as React from 'react'

declare global {
  interface Window {
    hostexWidget?: {
      init?: () => void
    }
  }

  type HostexElementProps = React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > & {
    [key: string]: any
  }

  namespace JSX {
    interface IntrinsicElements {
      'hostex-search-widget': HostexElementProps
      'hostex-search-result-widget': HostexElementProps
      'hostex-booking-widget': HostexElementProps
    }
  }
}

export {}
