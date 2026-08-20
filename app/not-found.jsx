import Link from 'next/link'
import { PenLine } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fdf8f0] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <PenLine className="w-9 h-9 text-amber-400" />
        </div>
        <h1 className="text-6xl font-serif font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Page not found</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Perhaps the entry was archived?
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-2.5 rounded-xl transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
