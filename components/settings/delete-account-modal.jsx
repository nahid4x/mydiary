'use client'

import { useState } from 'react'
import { X, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const REASONS = [
  ['privacy', 'Privacy concerns'],
  ['missing_features', 'Missing features'],
  ['bugs', 'Too many bugs'],
  ['switching', 'Switching apps'],
  ['break', 'Temporary break'],
  ['other', 'Other'],
]

export function DeleteAccountModal({ open, onClose, onScheduled }) {
  const [reason, setReason] = useState('')
  const [feedback, setFeedback] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!reason) {
      toast({ title: 'Please select a reason', variant: 'error' })
      return
    }
    if (!password) {
      toast({ title: 'Please enter your password', variant: 'error' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, feedback, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast({ title: 'Account deletion scheduled', variant: 'success' })
      onScheduled?.(data.scheduledDeletionDate)
      setReason('')
      setFeedback('')
      setPassword('')
      onClose()
    } catch (err) {
      toast({ title: err.message || 'Failed to schedule deletion', variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#17181C]/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-[22px] border border-[#ECE8DF] shadow-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="font-serif font-semibold text-[19px] text-[#17181C]">Delete your account?</h2>
          </div>
          <button onClick={onClose} className="text-[#8A8E96] hover:text-[#3A3D45]" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[13px] text-[#8A8E96] mb-5">
          Your account will be scheduled for deletion in 7 days. You can cancel anytime before then.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#3A3D45]">Why are you leaving?</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-11 rounded-xl border border-[#ECE8DF] text-[14px] px-3 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100 transition-all duration-300 bg-white"
            >
              <option value="" disabled>Select a reason</option>
              {REASONS.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {reason === 'other' && (
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#3A3D45]">Additional feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us more..."
                className="w-full min-h-[80px] rounded-xl border border-[#ECE8DF] text-[14px] p-3 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100 transition-all duration-300"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#3A3D45]">Confirm your password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-11 rounded-xl border border-[#ECE8DF] text-[14px] px-3 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100 transition-all duration-300"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-xl font-semibold border-0 text-white bg-red-500 hover:bg-red-600 transition-colors duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Scheduling...' : 'Schedule Account Deletion'}
          </button>
        </form>
      </div>
    </div>
  )
}