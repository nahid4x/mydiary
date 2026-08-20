'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, PenLine, Mail, Lock, User, Shield, Check } from 'lucide-react'
import { registerSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) })

  async function onSubmit(values) {
    setLoading(true)
    setServerError('')
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.error || 'Registration failed')
        return
      }
      // Auto sign in after register
      await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })
      toast({ title: 'Account created! Welcome to MyDiary 🎉', variant: 'success' })
      router.push('/dashboard')
      router.refresh()
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fieldVariants = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      {/* One extremely subtle light behind the card. Page background itself lives in the parent auth layout. */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-[#FF7A45]/[0.06] blur-[140px] -z-10" />

      {/* Card — brand lockup and heading live inside as one component */}
      <div
        className="rounded-[32px] bg-white mx-auto"
        style={{
          maxWidth: '480px',
          border: '1px solid #ECE8E2',
          padding: '56px 44px 44px',
          boxShadow: '0 1px 2px rgba(23,24,28,0.03), 0 4px 10px rgba(23,24,28,0.04), 0 32px 64px -16px rgba(23,24,28,0.12)',
        }}
      >
        {/* Brand lockup */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#FF7A45,#FF9A62)' }}
            >
              <PenLine className="w-4 h-4 text-white" strokeWidth={2.25} />
            </div>
            <span className="font-serif font-semibold text-[15px] tracking-tight text-[#17181C]">MyDiary</span>
          </div>
          <h1 className="text-[28px] font-serif font-bold text-[#17181C]" style={{ letterSpacing: '0.01em' }}>
            Start your diary
          </h1>
          <p className="text-[#8A8E96] mt-2 text-[14px] leading-relaxed">Create a free account in seconds</p>
        </div>

        {serverError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5"
          >
            {serverError}
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
        >
          {/* Name */}
          <motion.div className="space-y-1.5" variants={fieldVariants}>
            <label className="text-[13px] font-medium text-[#3A3D45]">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B0B4BB]" />
              <Input
                {...register('name')}
                placeholder="Your name"
                className="pl-10 h-[52px] rounded-2xl border-[#ECE8E2] text-[14px] placeholder:text-[#B0B4BB] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus:border-[#FF7A45]/50 focus:ring-4 focus:ring-[#FF7A45]/10"
                error={!!errors.name}
                autoComplete="name"
              />
            </div>
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </motion.div>

          {/* Email */}
          <motion.div className="space-y-1.5" variants={fieldVariants}>
            <label className="text-[13px] font-medium text-[#3A3D45]">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B0B4BB]" />
              <Input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="pl-10 h-[52px] rounded-2xl border-[#ECE8E2] text-[14px] placeholder:text-[#B0B4BB] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus:border-[#FF7A45]/50 focus:ring-4 focus:ring-[#FF7A45]/10"
                error={!!errors.email}
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </motion.div>

          {/* Password */}
          <motion.div className="space-y-1.5" variants={fieldVariants}>
            <label className="text-[13px] font-medium text-[#3A3D45]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B0B4BB]" />
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                className="pl-10 pr-11 h-[52px] rounded-2xl border-[#ECE8E2] text-[14px] placeholder:text-[#B0B4BB] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus:border-[#FF7A45]/50 focus:ring-4 focus:ring-[#FF7A45]/10"
                error={!!errors.password}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B0B4BB] hover:text-[#6B6F78] transition-colors"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </motion.div>

          {/* Confirm */}
          <motion.div className="space-y-1.5" variants={fieldVariants}>
            <label className="text-[13px] font-medium text-[#3A3D45]">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B0B4BB]" />
              <Input
                {...register('confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                className="pl-10 pr-11 h-[52px] rounded-2xl border-[#ECE8E2] text-[14px] placeholder:text-[#B0B4BB] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus:border-[#FF7A45]/50 focus:ring-4 focus:ring-[#FF7A45]/10"
                error={!!errors.confirmPassword}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B0B4BB] hover:text-[#6B6F78] transition-colors"
              >
                {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </motion.div>

          <motion.div variants={fieldVariants}>
            <Button
              type="submit"
              loading={loading}
              className="w-full h-[54px] text-[15px] mt-3 rounded-2xl font-semibold text-white border-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[2px] hover:scale-[1.01]"
              style={{
                background: 'linear-gradient(135deg,#FF7A45,#FF9A62)',
                boxShadow: '0 8px 20px -6px rgba(255,122,69,0.35), 0 16px 40px -12px rgba(255,122,69,0.3)',
              }}
            >
              Create Account
            </Button>
          </motion.div>
        </motion.form>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 mt-6 text-[11.5px] text-[#9A9EA6]">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Private by default</span>
          <span className="text-[#ECE8E2]">•</span>
          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> End-to-end encrypted</span>
          <span className="text-[#ECE8E2]">•</span>
          <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Secure cloud backup</span>
        </div>

        <p className="text-center text-[13.5px] text-[#8A8E96] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#FF7A45] hover:text-[#FF6B35] font-medium">
            Sign in
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-[#B0B4BB] mt-7">
        By signing up, you agree to keep your diary secure.
      </p>
    </motion.div>
  )
}