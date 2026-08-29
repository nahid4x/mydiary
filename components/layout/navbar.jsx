'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { PenLine, Menu, X, LayoutDashboard, BookOpen, Star, Archive, Calendar, User, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { NotificationBell } from './notification-bell'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Entries', href: '/entries', icon: BookOpen },
  { label: 'Favorites', href: '/favorites', icon: Star },
  { label: 'Archive', href: '/archive', icon: Archive },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
]

export function AppNavbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock background scroll while the mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prevOverflow
      }
    }
  }, [mobileOpen])

  const pageTitle = navItems.find((n) => pathname.startsWith(n.href))?.label || 'MyDiary'

  const mobileMenu = (
    <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 top-[68px] bg-[#17181C]/25 backdrop-blur-sm z-[90]"
            onClick={() => setMobileOpen(false)}
          />
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-[68px] w-72 max-w-[80vw] bg-white/95 backdrop-blur-2xl border-r border-[#ECE8DF] z-[100] p-4 space-y-1 overflow-y-auto"
            style={{ height: 'calc(100dvh - 68px)' }}
          >
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-300',
                    active ? 'bg-[#FFF1E8] text-[#FF7A45]' : 'text-[#6B6F78] hover:bg-[#FAF7F2]'
                  )}
                >
                  <item.icon className="w-[18px] h-[18px]" strokeWidth={1.85} />
                  {item.label}
                </Link>
              )
            })}
            <hr className="border-[#ECE8DF] my-2" />
            <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-medium text-[#6B6F78] hover:bg-[#FAF7F2]">
              <User className="w-[18px] h-[18px]" strokeWidth={1.85} /> Profile
            </Link>
            <Link href="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-medium text-[#6B6F78] hover:bg-[#FAF7F2]">
              <Settings className="w-[18px] h-[18px]" strokeWidth={1.85} /> Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-medium text-red-500 hover:bg-red-50 w-full"
            >
              <LogOut className="w-[18px] h-[18px]" strokeWidth={1.85} /> Sign Out
            </button>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <header className="sticky top-0 z-40 h-[68px] flex items-center bg-white/50 backdrop-blur-2xl border-b border-[#ECE8DF] px-3 md:px-8 gap-2 md:gap-4">
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-[#6B6F78] hover:bg-white transition-colors"
      >
        {mobileOpen ? <X className="w-[18px] h-[18px]" strokeWidth={1.85} /> : <Menu className="w-[18px] h-[18px]" strokeWidth={1.85} />}
      </button>

      <h1
        className="font-serif font-semibold text-[#17181C] tracking-tight truncate flex-1 min-w-0"
        style={{ fontSize: '10px', color: 'red' }}
      >
        {pageTitle}
      </h1>

      <Link href="/entries/new" className="shrink-0">
        <Button
          size="sm"
          className="gap-1.5 h-[38px] px-3 md:px-4 rounded-xl font-semibold border-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[1px]"
          style={{
            background: 'linear-gradient(135deg,#FF7A45,#FF9A62)',
            boxShadow: '0 6px 18px -6px rgba(255,122,69,0.45)',
          }}
        >
          <PenLine className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Entry</span>
        </Button>
      </Link>

      <div className="shrink-0 scale-90 md:scale-100">
        <NotificationBell />
      </div>

      <Link href="/profile" className="shrink-0">
        <div
          className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-white font-semibold text-[12px] md:text-[13px] transition-transform duration-300 hover:scale-105"
          style={{
            background: session?.user?.avatar ? 'transparent' : 'linear-gradient(135deg,#FF7A45,#FF9A62)',
            boxShadow: '0 0 0 2px #FFFFFF, 0 0 0 3px #ECE8DF',
          }}
        >
          {session?.user?.avatar ? (
            <img src={session.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            session?.user?.name?.[0]?.toUpperCase() || 'U'
          )}
        </div>
      </Link>

      {/* Portal the drawer to <body> so `position: fixed` resolves against the
          viewport instead of this header, which creates its own containing
          block for fixed descendants because it uses backdrop-blur (a
          backdrop-filter). Without this, the drawer was being sized/positioned
          inside the 68px header box and was invisible even though the state
          (mobileOpen) and icon toggle were working correctly. */}
      {mounted && createPortal(mobileMenu, document.body)}
    </header>
  )
}