'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

const STATUS_STYLES = {
  OPEN: 'bg-[#FFF1E8] text-[#FF7A18]',
  IN_REVIEW: 'bg-[#EAF2FF] text-[#3A6FF7]',
  NEED_MORE_INFO: 'bg-[#FFF7E0] text-[#B88A00]',
  RESOLVED: 'bg-[#E8F8EE] text-[#1F9D55]',
  CLOSED: 'bg-[#F0F0F0] text-[#6B6F78]',
}

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

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState(null)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    fetch('/api/admin/tickets')
      .then((r) => {
        if (r.status === 403) {
          setForbidden(true)
          return { tickets: [] }
        }
        return r.json()
      })
      .then((data) => setTickets(data.tickets || []))
      .catch(() => setTickets([]))
  }, [])

  if (forbidden) {
    return (
      <div className="max-w-3xl mx-auto">
        <Panel className="p-8 text-center">
          <p className="text-[14px] text-[#8A8E96]">You don't have access to this page.</p>
        </Panel>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-[#17181C] tracking-tight">Support Tickets</h1>
        <p className="text-[13.5px] text-[#8A8E96] mt-1">All reports submitted by users</p>
      </div>

      {tickets === null && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/60 rounded-[18px] border border-[#ECE8DF] h-20 animate-pulse" />
          ))}
        </div>
      )}

      {tickets?.length === 0 && (
        <Panel className="p-8 text-center">
          <p className="text-[14px] text-[#8A8E96]">No tickets yet.</p>
        </Panel>
      )}

      <div className="space-y-3">
        {tickets?.map((t) => (
          <Link key={t.id} href={`/admin/tickets/${t.id}`}>
            <Panel className="p-5 hover:border-[#FF7A45]/40 transition-colors duration-200 cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11.5px] font-mono text-[#B0B4BB]">{t.ticketNumber}</p>
                  <p className="font-medium text-[15px] text-[#17181C] truncate">{t.subject}</p>
                  <p className="text-[12.5px] text-[#8A8E96] mt-0.5">
                    {t.user?.name} ({t.user?.email}) · {CATEGORY_LABELS[t.category] || t.category} · {formatDate(t.createdAt)}
                  </p>
                </div>
                <span className={`shrink-0 text-[11.5px] font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[t.status] || ''}`}>
                  {t.status.replace(/_/g, ' ')}
                </span>
              </div>
            </Panel>
          </Link>
        ))}
      </div>
    </div>
  )
}