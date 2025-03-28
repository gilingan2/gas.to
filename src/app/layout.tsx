import { ConsentBanner } from '@/components/analytics/ConsentBanner'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shortlink & Bio Pages',
  description: 'Create and manage your short links and bio pages',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ConsentBanner />
      </body>
    </html>
  )
}