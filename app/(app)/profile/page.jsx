'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Check, Loader2 } from 'lucide-react'
import { profileSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ChangeEmailForm } from '@/components/profile/change-email-form'
import { toast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'

function Panel({ children, className = '' }) {
  return (
    <div className={`bg-white/70 backdrop-blur-md rounded-[22px] border border-[#ECE8DF] ${className}`}>
      {children}
    </div>
  )
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [savedOk, setSavedOk] = useState(false)
  const fileRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(profileSchema) })

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user)
        setAvatarPreview(data.user?.avatar)
        reset({ name: data.user?.name || '', bio: data.user?.bio || '' })
      })
      .finally(() => setLoading(false))
  }, [reset])

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Image too large', description: 'Max 10MB', variant: 'error' })
      return
    }
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'avatars')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Upload did not return a valid URL')
      }

      const profileRes = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name, bio: user.bio || '', avatar: data.url }),
      })
      const profileData = await profileRes.json()

      if (!profileRes.ok) {
        throw new Error(profileData.error || 'Failed to save avatar to profile')
      }

      setUser((u) => ({ ...u, avatar: data.url }))
      await update({ avatar: data.url })
      toast({ title: 'Profile photo updated', variant: 'success' })
    } catch (err) {
      console.error('Avatar upload error:', err)
      toast({ title: err.message || 'Upload failed', variant: 'error' })
      setAvatarPreview(user?.avatar)
    } finally {
      setAvatarUploading(false)
    }
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, avatar: user?.avatar }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUser(data.user)
      await update({ name: data.user.name, avatar: data.user.avatar })
      reset({ name: data.user.name, bio: data.user.bio || '' })
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 2500)
      toast({ title: 'Profile saved', variant: 'success' })
    } catch (err) {
      toast({ title: err.message || 'Failed to save', variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white/60 rounded-[22px] border border-[#ECE8DF] h-32 animate-pulse" />
        ))}
      </div>
    )
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="max-w-xl mx-auto space-y-7">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-[#17181C] tracking-tight">Profile</h1>
        <p className="text-[13.5px] text-[#8A8E96] mt-1">Manage your personal information</p>
      </div>

      <Panel className="p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
              style={{ background: avatarPreview ? 'transparent' : 'linear-gradient(135deg,#FF7A45,#FF9A62)' }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-serif font-semibold text-white">{initials}</span>
              )}
              {avatarUploading && (
                <div className="absolute inset-0 bg-[#17181C]/40 rounded-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full text-white flex items-center justify-center transition-transform duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg,#FF7A45,#FF9A62)',
                boxShadow: '0 0 0 2px #FFFFFF, 0 6px 16px -4px rgba(255,122,69,0.5)',
              }}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
          <div>
            <p className="font-serif font-semibold text-[17px] text-[#17181C]">{user?.name}</p>
            <p className="text-[13.5px] text-[#8A8E96]">{user?.email}</p>
            {user?.createdAt && (
              <p className="text-[12px] text-[#B0B4BB] mt-1">Member since {formatDate(user.createdAt)}</p>
            )}
          </div>
        </div>
      </Panel>

      <Panel className="p-6">
        <h2 className="font-serif font-semibold text-[17px] text-[#17181C] mb-5">Personal information</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#3A3D45]">Full name</label>
            <Input
              {...register('name')}
              error={!!errors.name}
              className="h-11 rounded-xl border-[#ECE8DF] text-[14px] focus:border-[#FF7A45]/50 focus:ring-4 focus:ring-[#FF7A45]/10 transition-all duration-300"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <ChangeEmailForm
            currentEmail={user?.email || ''}
            onEmailUpdated={(newEmail) => setUser((u) => ({ ...u, email: newEmail }))}
          />

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#3A3D45]">Bio</label>
            <Textarea
              {...register('bio')}
              placeholder="Tell a little about yourself..."
              className="min-h-[88px] rounded-xl border-[#ECE8DF] text-[14px] focus:border-[#FF7A45]/50 focus:ring-4 focus:ring-[#FF7A45]/10 transition-all duration-300"
            />
            {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
          </div>

          <Button
            type="submit"
            loading={saving}
            disabled={!isDirty}
            className="gap-2 h-11 px-6 rounded-xl font-semibold border-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[1px] disabled:opacity-50 disabled:hover:translate-y-0"
            style={{
              background: 'linear-gradient(135deg,#FF7A45,#FF9A62)',
              boxShadow: '0 8px 20px -6px rgba(255,122,69,0.4)',
            }}
          >
            {savedOk ? (
              <><Check className="w-4 h-4" /> Saved!</>
            ) : (
              'Save changes'
            )}
          </Button>
        </form>
      </Panel>
    </div>
  )
}