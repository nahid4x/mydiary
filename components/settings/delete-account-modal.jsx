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
    if (!reason) { toast({ title: 'Please select a reason', variant: 'error' }); return }
    if (!password) { toast({ title: 'Please enter your password', variant: 'error' }); return }
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
      setReason(''); setFeedback(''); setPassword('')
      onClose()
    } catch (err) {
      toast({ title: err.message || 'Failed to schedule deletion', variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#17181C]/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — fixed width, centered, not full-width */}
      <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }} className="relative bg-white rounded-[20px] border border-[#ECE8DF] shadow-2xl p-5">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4.5 h-4.5 text-red-500 shrink-0" />
            <h2 className="font-serif font-semibold text-[17px] text-[#17181C]">Delete your account?</h2>
          </div>
          <button onClick={onClose} className="text-[#8A8E96] hover:text-[#3A3D45] ml-2 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[12.5px] text-[#8A8E96] mb-4 leading-relaxed">
          Your account will be scheduled for deletion in 7 days. You can cancel anytime before then.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Reason */}
          <div className="space-y-1">
            <label className="text-[12.5px] font-medium text-[#3A3D45]">Why are you leaving?</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-10 rounded-xl border border-[#ECE8DF] text-[13.5px] px-3 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all bg-white"
            >
              <option value="" disabled>Select a reason</option>
              {REASONS.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* Optional feedback */}
          {reason === 'other' && (
            <div className="space-y-1">
              <label className="text-[12.5px] font-medium text-[#3A3D45]">Additional feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us more..."
                className="w-full min-h-[70px] rounded-xl border border-[#ECE8DF] text-[13.5px] p-3 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all resize-none"
              />
            </div>
          )}

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[12.5px] font-medium text-[#3A3D45]">Confirm your password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-10 rounded-xl border border-[#ECE8DF] text-[13.5px] px-3 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-10 rounded-xl font-semibold text-[13.5px] text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? 'Scheduling...' : 'Schedule Account Deletion'}
          </button>
        </form>
      </div>
    </div>
  )
}