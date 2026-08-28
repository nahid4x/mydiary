import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'
import Script from 'next/script'

export const metadata = {
  title: 'MyDiary — Your Personal Journal',
  description: 'A private, secure space to capture your thoughts, memories, and moments.',
}


export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased overflow-x-hidden"> {/* ADD overflow-x-hidden */}
        <Providers>{children}</Providers>
        <Toaster />
        <Script src="/devtools-guard.js" strategy="beforeInteractive" />
      </body>
    </html>
  )
}