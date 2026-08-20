'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Send } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

const STATUS_STYLES = {
  OPEN: 'bg-[#FFF1E8] text-[#FF7A18]',
  IN_REVIEW: 'bg-[#EAF2FF] text-[#3A6FF7]',
  NEED_MORE_INFO: 'bg-[#FFF7E0] text-[#B88A00]',
  RESOLVED: 'bg-[#E8F8EE] text-[#1F9D55]',
  CLOSED: 'bg-[#F0F0F0] text-[#6B6F78]',
}

const STATUS_OPTIONS = ['OPEN', 'IN_REVIEW', 'NEED_MORE_INFO', 'RESOLVED', 'CLOSED']

const CATEGORY_LABELS = {
  BUG: 'Bug / Technical Issue',
  FEATURE_REQUEST: 'Feature Request',
  PRIVACY_CONCERN: 'Privacy Concern',
  SECURITY_VULNERABILITY: 'Security Vulnerability',
  ACCOUNT_ISSUE: 'Account Issue',
  PAYMENT: 'Payment / Subscription',
  CONTENT_PROBLEM: 'Content Problem',
  PERFORMANCE_ISSUE: 'Performance Issue',
  UI_UX_FEEDBACK: 'UI / UX Feedback',
  TRANSLATION_ISSUE: 'Translation Issue',
  DATA_SYNC_ISSUE: 'Data Sync Issue',
  OTHER: 'Other',
}

function Panel({ children, className = '' }) {
  return (
    <div className={`bg-white/70 backdrop-blur-md rounded-[22px] border border-[#ECE8DF] ${className}`}>
      {children}
    </div>
  )
}

export default function AdminTicketDetailPage() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  async function loadTicket() {
    const res = await fetch(`/api/admin/tickets/${id}`)
    if (!res.ok) {
      setNotFound(true)
      return
    }
    const data = await res.json()
    setTicket(data.ticket)
  }

  useEffect(() => {
    loadTicket()
  }, [id])

  async function handleReply(e) {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) return

    setSending(true)
    try {
      const res = await fetch(`/api/admin/tickets/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessage('')
      await loadTicket()
      toast({ title: 'Reply sent', variant: 'success' })
    } catch (err) {
      toast({ title: err.message || 'Failed to send reply', variant: 'error' })
    } finally {
      setSending(false)
    }
  }

  async function handleStatusChange(newStatus) {
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTicket((t) => ({ ...t, status: newStatus }))
      toast({ title: 'Status updated', variant: 'success' })
    } catch (err) {
      toast({ title: err.message || 'Failed to update status', variant: 'error' })
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/admin/tickets" className="inline-flex items-center gap-1.5 text-[13px] text-[#8A8E96] hover:text-[#3A3D45]">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Tickets
        </Link>
        <Panel className="p-8 text-center">
          <p className="text-[14px] text-[#8A8E96]">This ticket doesn't exist or you don't have access.</p>
        </Panel>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white/60 rounded-[18px] border border-[#ECE8DF] h-24 animate-pulse" />
        <div className="bg-white/60 rounded-[18px] border border-[#ECE8DF] h-40 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/tickets" className="inline-flex items-center gap-1.5 text-[13px] text-[#8A8E96] hover:text-[#3A3D45] mb-3">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Tickets
        </Link>

        <Panel className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11.5px] font-mono text-[#B0B4BB]">{ticket.ticketNumber}</p>
              <h1 className="font-serif font-semibold text-[19px] text-[#17181C]">{ticket.subject}</h1>
              <p className="text-[12.5px] text-[#8A8E96] mt-0.5">
                {ticket.user?.name} ({ticket.user?.email}) · {CATEGORY_LABELS[ticket.category] || ticket.category} · Opened {formatDate(ticket.createdAt)}
              </p>
            </div>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              className={`shrink-0 text-[11.5px] font-medium px-2.5 py-1.5 rounded-full border-0 cursor-pointer outline-none ${STATUS_STYLES[ticket.status] || ''}`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <p className="text-[13px] text-[#3A3D45] mt-4 pt-4 border-t border-[#ECE8DF] whitespace-pre-wrap">
            {ticket.description}
          </p>

          {ticket.attachments?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#ECE8DF]">
              {ticket.attachments.map((a) => (
                <a
                  key={a.id}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12.5px] text-[#FF7A45] hover:underline"
                >
                  {a.filename}
                </a>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="space-y-3">
        {ticket.replies.map((r) => (
          <div key={r.id} className={`flex ${r.isAdmin ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-[16px] px-4 py-3 ${
                r.isAdmin ? 'bg-[#FF7A45]/10 border border-[#FF7A45]/20' : 'bg-white border border-[#ECE8DF]'
              }`}
            >
              <p className="text-[13px] text-[#17181C] whitespace-pre-wrap">{r.message}</p>
              <p className="text-[11px] text-[#B0B4BB] mt-1">
                {r.isAdmin ? 'You (Support)' : ticket.user?.name} · {formatDate(r.createdAt)} {formatTime(r.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleReply} className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Reply to this ticket..."
          className="flex-1 h-11 rounded-xl border border-[#ECE8DF] text-[14px] px-3 outline-none focus:border-[#FF7A45]/50 focus:ring-4 focus:ring-[#FF7A45]/10 transition-all duration-300 bg-white"
        />
        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="h-11 px-4 rounded-xl font-semibold border-0 text-white disabled:opacity-50 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#FF7A45,#FF9A62)' }}
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  )
}