'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Star, Archive, Calendar, Settings,
  LogOut, PenLine, User, ChevronLeft, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'All Entries', href: '/entries', icon: BookOpen },
  { label: 'Favorites', href: '/favorites', icon: Star },
  { label: 'Archive', href: '/archive', icon: Archive },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
]

const bottomItems = [
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
]

/* ---------------------------------------------------------
   Same tokens as landing/login/dashboard:
   bg        #FFFCFA (page) / white/60 glass panels
   ink       #17181C / #6B6F78 / #8A8E96
   orange    #FF7A45 → #FF9A62
   ring      #ECE8DF hairline
--------------------------------------------------------- */

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 252 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="hidden md:flex flex-col h-screen sticky top-0 shrink-0 bg-white/50 backdrop-blur-2xl border-r border-[#ECE8DF] px-3 py-4"
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-2.5 px-2.5 pb-5 mb-1', collapsed && 'justify-center px-0')}>
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,#FF7A45,#FF9A62)' }}
        >
          <PenLine className="w-4 h-4 text-white" strokeWidth={2.25} />
        </div>
        {!collapsed && (
          <span className="font-serif font-semibold text-[#17181C] text-[17px] tracking-tight">MyDiary</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group',
                active
                  ? 'text-[#FF7A45]'
                  : 'text-[#6B6F78] hover:bg-white hover:text-[#17181C]',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: '#FFF1E8',
                    border: '1px solid rgba(255,122,69,0.14)',
                  }}
                />
              )}
              <item.icon
                className={cn('w-[18px] h-[18px] shrink-0 relative z-[1]', active ? 'text-[#FF7A45]' : 'text-[#B0B4BB] group-hover:text-[#6B6F78]')}
                strokeWidth={1.85}
              />
              {!collapsed && <span className="relative z-[1]">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="space-y-1 border-t border-[#ECE8DF] pt-3">
        {bottomItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-300 group',
                active ? 'text-[#FF7A45] bg-[#FFF1E8]' : 'text-[#6B6F78] hover:bg-white hover:text-[#17181C]',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn('w-[18px] h-[18px] shrink-0', active ? 'text-[#FF7A45]' : 'text-[#B0B4BB] group-hover:text-[#6B6F78]')} strokeWidth={1.85} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={cn(
            'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-medium text-[#8A8E96] hover:bg-red-50 hover:text-red-500 transition-all duration-300 w-full group',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.85} />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-medium text-[#B0B4BB] hover:text-[#6B6F78] hover:bg-white transition-all duration-300 w-full',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" strokeWidth={1.85} /> : (
            <>
              <ChevronLeft className="w-4 h-4" strokeWidth={1.85} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  )
}