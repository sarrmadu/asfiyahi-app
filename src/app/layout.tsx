import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Dahira Asfiyahi Mbour',
    template: '%s · Dahira Asfiyahi',
  },
  description: 'Gestion du Dahira Asfiyahi de Mbour',
  // Prépare l'installation en PWA (le manifest viendra plus tard)
  appleWebApp: {
    capable: true,
    title: 'Asfiyahi',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  themeColor: '#0B5D2E',
  width: 'device-width',
  initialScale: 1,
  // On n'interdit PAS le zoom : certains membres en ont besoin pour lire.
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
