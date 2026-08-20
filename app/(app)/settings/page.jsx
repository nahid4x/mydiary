'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Shield, LogOut, Trash2, AlertTriangle, Undo2 } from 'lucide-react'
import { changePasswordSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { HelpSupportCard } from '@/components/settings/help-support-card'
import { DeleteAccountModal } from '@/components/settings/delete-account-modal'
import { toast } from '@/hooks/use-toast'

function PasswordField({ label, name, register, error, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <Input
          {...register(name)}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          className="pr-10"
          error={!!error}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [showSignOut, setShowSignOut] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [scheduledDeletionDate, setScheduledDeletionDate] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(changePasswordSchema) })

  useEffect(() => {
    let cancelled = false
    async function fetchStatus() {
      try {
        const res = await fetch('/api/account/delete')
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) {
          setScheduledDeletionDate(data.scheduledDeletionDate || null)
        }
      } catch {
        // silently ignore — banner just won't show
      } finally {
        if (!cancelled) setLoadingStatus(false)
      }
    }
    fetchStatus()
    return () => {
      cancelled = true
    }
  }, [])

  async function onPasswordSubmit(values) {
    setSaving(true)
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Password updated successfully', variant: 'success' })
      reset()
    } catch (err) {
      toast({ title: err.message || 'Failed to update password', variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  async function handleCancelDeletion() {
    setCancelling(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setScheduledDeletionDate(null)
      toast({ title: 'Account deletion cancelled', variant: 'success' })
    } catch (err) {
      toast({ title: err.message || 'Failed to cancel deletion', variant: 'error' })
    } finally {
      setCancelling(false)
    }
  }

  const deletionPending = !loadingStatus && !!scheduledDeletionDate

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and security</p>
      </div>

      {deletionPending && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">
              Your account is scheduled for deletion on{' '}
              {new Date(scheduledDeletionDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              .
            </p>
            <p className="text-sm text-red-600 mt-0.5">
              You can cancel this anytime before then to keep your account.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelDeletion}
              loading={cancelling}
              className="gap-2 mt-3 text-red-600 border-red-300 hover:bg-red-100"
            >
              <Undo2 className="w-4 h-4" />
              Cancel Deletion
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>Keep your account secure with a strong password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            <PasswordField
              label="Current Password"
              name="currentPassword"
              register={register}
              error={errors.currentPassword}
              placeholder="Enter current password"
            />
            <PasswordField
              label="New Password"
              name="newPassword"
              register={register}
              error={errors.newPassword}
              placeholder="At least 8 characters"
            />
            <PasswordField
              label="Confirm New Password"
              name="confirmPassword"
              register={register}
              error={errors.confirmPassword}
              placeholder="Repeat new password"
            />
            <Button type="submit" loading={saving}>
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LogOut className="w-5 h-5 text-gray-400" />
            <CardTitle>Session</CardTitle>
          </div>
          <CardDescription>Manage your current login session</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => setShowSignOut(true)}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out of MyDiary
          </Button>
        </CardContent>
      </Card>

      <HelpSupportCard />

      <Card className="border-red-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <CardTitle className="text-red-700">Danger Zone</CardTitle>
          </div>
          <CardDescription>Irreversible actions — proceed with caution</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            {deletionPending
              ? 'Your account is already scheduled for deletion. Use the banner above to cancel it if you changed your mind.'
              : 'Deleting your account will permanently remove all diary entries after a 7-day grace period. This action cannot be undone after the grace period ends.'}
          </p>
          <Button
            variant="outline"
            disabled={deletionPending}
            onClick={() => setShowDeleteModal(true)}
            className="gap-2 text-red-500 border-red-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showSignOut}
        onClose={() => setShowSignOut(false)}
        onConfirm={() => signOut({ callbackUrl: '/' })}
        title="Sign out?"
        description="You'll be returned to the home page."
        confirmLabel="Sign out"
      />

      <DeleteAccountModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onScheduled={(date) => setScheduledDeletionDate(date)}
      />
    </div>
  )
}