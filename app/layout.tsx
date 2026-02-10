import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'LabLense - Benchmarking Dashboard',
  description: 'Benchmarking-WebApp fur deutsche Krankenhauser zur Optimierung von Laboranforderungen',
}

export const viewport: Viewport = {
  themeColor: '#2d8a6e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <body className={`${_inter.variable} ${_jetbrains.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
