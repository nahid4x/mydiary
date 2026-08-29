'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, MessageSquare, Reply, UserX, UserCheck, Trash2, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TYPE_ICONS = {
  NEW_TICKET: MessageSquare,
  TICKET_REPLY: Reply,
  DELETION_REQUESTED: UserX,
  DELETION_CANCELLED: UserCheck,
  DELETION_COMPLETED: Trash2,
  SECURITY: ShieldAlert,
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)

  async function load() {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {
      // fail silently, bell just shows no badge
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function markOneRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount((c) => Math.max(0, c - 1))
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
    } catch {
      load()
    }
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' })
    } catch {
      load()
    }
  }

  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-[#E8ECF3] text-[#3A3D45] transition-colors duration-300 hover:bg-[#FFF7F2]"
        aria-label="Notifications"
      >
        <Bell className="w-[17px] h-[17px]" strokeWidth={1.85} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-semibold text-white flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#FF7A45,#FF9A62)' }}
          >
            {badgeLabel}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 mt-2 max-h-[420px] overflow-y-auto bg-white rounded-2xl border border-[#ECE8DF] shadow-xl z-50"
style={{ width: 'min(320px, calc(100vw - 16px))', right: 0 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#ECE8DF]">
              <p className="font-serif font-semibold text-[15px] text-[#17181C]">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[12px] font-medium text-[#FF7A45] hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {!loading && notifications.length === 0 && (
              <div className="px-6 py-10 text-center">
                <p className="text-[13.5px] font-medium text-[#17181C]">You're all caught up</p>
                <p className="text-[12.5px] text-[#8A8E96] mt-1">No new notifications right now.</p>
              </div>
            )}

            <div className="divide-y divide-[#F2EFE8]">
              {notifications.map((n) => {
                const Icon = TYPE_ICONS[n.type] || Bell
                const content = (
                  <div
                    className={`flex gap-3 px-4 py-3 transition-colors duration-200 cursor-pointer ${
                      n.read ? 'hover:bg-[#FAF7F2]' : 'bg-[#FFF7F2] hover:bg-[#FFF1E8]'
                    }`}
                    onClick={() => !n.read && markOneRead(n.id)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#ECE8DF] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#FF7A45]" strokeWidth={1.85} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-medium text-[#17181C] leading-snug">{n.title}</p>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A45] shrink-0 mt-1.5" />}
                      </div>
                      {n.body && <p className="text-[12px] text-[#8A8E96] mt-0.5 leading-snug">{n.body}</p>}
                      <p className="text-[11px] text-[#B0B4BB] mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                )
                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => setOpen(false)}>
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                )
              })}
            </div>

           
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}