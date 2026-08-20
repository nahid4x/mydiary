'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, X, Loader2 } from 'lucide-react'
import { changeEmailSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'

export function ChangeEmailForm({ currentEmail, onEmailUpdated }) {
  const { update } = useSession()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(changeEmailSchema) })

  async function onSubmit(values) {
    setSaving(true)
    try {
      const res = await fetch('/api/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      await update({ email: values.newEmail })

      toast({ title: 'Email updated successfully', variant: 'success' })
      onEmailUpdated?.(values.newEmail)
      reset()
      setEditing(false)
    } catch (err) {
      toast({ title: err.message || 'Failed to update email', variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-[#3A3D45]">Email</label>
        <div className="flex items-center gap-2">
          <Input
            value={currentEmail}
            disabled
            className="h-11 rounded-xl border-[#ECE8DF] text-[14px] opacity-60 cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 w-11 h-11 rounded-xl border border-[#ECE8DF] flex items-center justify-center text-[#8A8E96] hover:text-[#FF7A45] hover:border-[#FF7A45]/40 transition-colors duration-300"
            aria-label="Edit email"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-[#ECE8DF] p-4 bg-white/60">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-[#3A3D45]">Change email</label>
        <button
          type="button"
          onClick={() => { setEditing(false); reset() }}
          className="text-[#8A8E96] hover:text-[#3A3D45] transition-colors duration-300"
          aria-label="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-[#8A8E96]">New email</label>
        <Input
          {...register('newEmail')}
          type="email"
          placeholder="new@example.com"
          error={!!errors.newEmail}
          className="h-11 rounded-xl border-[#ECE8DF] text-[14px] focus:border-[#FF7A45]/50 focus:ring-4 focus:ring-[#FF7A45]/10 transition-all duration-300"
        />
        {errors.newEmail && <p className="text-xs text-red-500">{errors.newEmail.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-[#8A8E96]">Current password</label>
        <Input
          {...register('currentPassword')}
          type="password"
          placeholder="Confirm with your password"
          error={!!errors.currentPassword}
          className="h-11 rounded-xl border-[#ECE8DF] text-[14px] focus:border-[#FF7A45]/50 focus:ring-4 focus:ring-[#FF7A45]/10 transition-all duration-300"
        />
        {errors.currentPassword && (
          <p className="text-xs text-red-500">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={saving}
          className="gap-2 h-10 px-5 rounded-xl font-semibold border-0 text-white transition-all duration-300 disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg,#FF7A45,#FF9A62)',
            boxShadow: '0 8px 20px -6px rgba(255,122,69,0.4)',
          }}
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Update Email
        </Button>
        <button
          type="button"
          onClick={() => { setEditing(false); reset() }}
          className="h-10 px-5 rounded-xl text-[13.5px] font-medium text-[#3A3D45] border border-[#ECE8DF] hover:bg-[#F5F2EA] transition-colors duration-300"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}