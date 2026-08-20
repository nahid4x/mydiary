'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, UploadCloud, Loader2, FileText, Trash2 } from 'lucide-react'
import { reportTicketSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'

const CATEGORY_OPTIONS = [
  ['BUG', 'Bug / Technical Issue'],
  ['FEATURE_REQUEST', 'Feature Request'],
  ['PRIVACY_CONCERN', 'Privacy Concern'],
  ['SECURITY_VULNERABILITY', 'Security Vulnerability'],
  ['ACCOUNT_ISSUE', 'Account Issue'],
  ['PAYMENT', 'Payment / Subscription'],
  ['CONTENT_PROBLEM', 'Content Problem'],
  ['PERFORMANCE_ISSUE', 'Performance Issue'],
  ['UI_UX_FEEDBACK', 'UI / UX Feedback'],
  ['TRANSLATION_ISSUE', 'Translation Issue'],
  ['DATA_SYNC_ISSUE', 'Data Sync Issue'],
  ['OTHER', 'Other'],
]

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf']
const MAX_FILE_MB = 10

export function ReportIssueModal({ open, onClose, onSubmitted }) {
  const [saving, setSaving] = useState(false)
  const [files, setFiles] = useState([]) // { file, previewUrl, uploading, uploadedUrl }
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reportTicketSchema),
    defaultValues: { priority: 'MEDIUM', contactPermission: false },
  })

  if (!open) return null

  function addFiles(fileList) {
    const incoming = Array.from(fileList)
    const valid = incoming.filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        toast({ title: `${f.name}: unsupported file type`, variant: 'error' })
        return false
      }
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        toast({ title: `${f.name}: exceeds ${MAX_FILE_MB}MB`, variant: 'error' })
        return false
      }
      return true
    })
    setFiles((prev) => [
      ...prev,
      ...valid.map((file) => ({
        file,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        uploading: false,
        uploadedUrl: null,
      })),
    ])
  }

  function removeFile(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  async function uploadAllFiles() {
    const uploaded = []
    for (const entry of files) {
      const fd = new FormData()
      fd.append('file', entry.file)
      fd.append('type', 'support-attachments')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(`Failed to upload ${entry.file.name}`)
      uploaded.push({
        url: data.url,
        filename: entry.file.name,
        mimeType: entry.file.type,
        size: entry.file.size,
      })
    }
    return uploaded
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const attachments = files.length ? await uploadAllFiles() : []

      const deviceInfo = {
        browser: navigator.userAgent,
        os: navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        appVersion: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }

   const res = await fetch('/api/tickets',  {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, ...deviceInfo, attachments }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast({ title: `Report submitted — ${data.ticket.ticketNumber}`, variant: 'success' })
      onSubmitted?.(data.ticket)
      reset()
      setFiles([])
      onClose()
    } catch (err) {
      toast({ title: err.message || 'Failed to submit report', variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#17181C]/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-[22px] border border-[#ECE8DF] shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif font-semibold text-[19px] text-[#17181C]">Report an Issue</h2>
          <button onClick={onClose} className="text-[#8A8E96] hover:text-[#3A3D45]" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#3A3D45]">Category</label>
            <select
              {...register('category')}
              defaultValue=""
              className="w-full h-11 rounded-xl border border-[#ECE8DF] text-[14px] px-3 focus:border-[#FF7A45]/50 focus:ring-4 focus:ring-[#FF7A45]/10 transition-all duration-300 bg-white"
            >
              <option value="" disabled>Select category</option>
              {CATEGORY_OPTIONS.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#3A3D45]">Subject</label>
            <Input
              {...register('subject')}
              placeholder="Short summary of the issue"
              error={!!errors.subject}
              className="h-11 rounded-xl border-[#ECE8DF] text-[14px] focus:border-[#FF7A45]/50 focus:ring-4 focus:ring-[#FF7A45]/10 transition-all duration-300"
            />
            {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#3A3D45]">Description</label>
            <Textarea
              {...register('description')}
              placeholder="Please describe the issue in as much detail as possible..."
              className="min-h-[100px] rounded-xl border-[#ECE8DF] text-[14px] focus:border-[#FF7A45]/50 focus:ring-4 focus:ring-[#FF7A45]/10 transition-all duration-300"
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#3A3D45]">Steps to reproduce <span className="text-[#B0B4BB] font-normal">(optional)</span></label>
            <Textarea
              {...register('stepsToReproduce')}
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
              className="min-h-[70px] rounded-xl border-[#ECE8DF] text-[14px] focus:border-[#FF7A45]/50 focus:ring-4 focus:ring-[#FF7A45]/10 transition-all duration-300"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#3A3D45]">Attachments <span className="text-[#B0B4BB] font-normal">(optional)</span></label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                addFiles(e.dataTransfer.files)
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-colors duration-300 ${
                dragOver ? 'border-[#FF7A45] bg-[#FF7A45]/5' : 'border-[#ECE8DF] hover:border-[#FF7A45]/40'
              }`}
            >
              <UploadCloud className="w-6 h-6 mx-auto text-[#B0B4BB] mb-1.5" />
              <p className="text-[13px] text-[#8A8E96]">
                Drag & drop, or <span className="text-[#FF7A45] font-medium">browse</span>
              </p>
              <p className="text-[11px] text-[#B0B4BB] mt-0.5">PNG, JPG, WEBP, PDF · up to {MAX_FILE_MB}MB each</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_TYPES.join(',')}
                onChange={(e) => addFiles(e.target.files)}
                className="hidden"
              />
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                {files.map((f, idx) => (
                  <div key={idx} className="relative rounded-lg border border-[#ECE8DF] overflow-hidden h-20 bg-[#F5F2EA] flex items-center justify-center">
                    {f.previewUrl ? (
                      <img src={f.previewUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-6 h-6 text-[#8A8E96]" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(idx) }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#17181C]/60 text-white flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-[13px] text-[#3A3D45]">
            <input type="checkbox" {...register('contactPermission')} className="rounded border-[#ECE8DF]" />
            Allow MyDiary support to contact me regarding this issue.
          </label>

          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
            className="w-full gap-2 h-11 rounded-xl font-semibold border-0 text-white transition-all duration-300 disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg,#FF7A45,#FF9A62)',
              boxShadow: '0 8px 20px -6px rgba(255,122,69,0.4)',
            }}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </div>
    </div>
  )
}