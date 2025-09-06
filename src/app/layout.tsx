import type { Metadata, Viewport } from 'next'
import { Figtree } from 'next/font/google'
import './globals.css'

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'A Moita - Refúgio Natural',
  description:
    'Our commitment to green energy is paving the way for a cleaner, healthier planet. Join us on a journey towards a future where clean, renewable energy sources transform the way we power our lives.',
  keywords: [
    'green energy',
    'renewable energy',
    'solar power',
    'wind energy',
    'sustainability',
  ],
  authors: [{ name: 'A Moita' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={figtree.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
      </head>
      <body
        className={`${figtree.className} text-body bg-body font-body antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
