'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, PenLine, Mail, Lock } from 'lucide-react'
import { loginSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values) {
    setLoading(true)
    setServerError('')
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })
      if (result?.error) {
        setServerError('Invalid email or password. Please try again.')
      } else {
        toast({ title: 'Welcome back!', variant: 'success' })
        router.push('/dashboard')
        router.refresh()
      }
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
            Welcome back
          </h1>
          <p className="text-[#8A8E96] mt-2 text-[14px] leading-relaxed">Sign in to continue your journey</p>
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
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-[#3A3D45]">Password</label>
              <Link href="#" className="text-[12.5px] text-[#FF7A45] hover:text-[#FF6B35] transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B0B4BB]" />
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="pl-10 pr-11 h-[52px] rounded-2xl border-[#ECE8E2] text-[14px] placeholder:text-[#B0B4BB] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus:border-[#FF7A45]/50 focus:ring-4 focus:ring-[#FF7A45]/10"
                error={!!errors.password}
                autoComplete="current-password"
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
              Sign In
            </Button>
          </motion.div>
        </motion.form>

        <p className="text-center text-[13.5px] text-[#8A8E96] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#FF7A45] hover:text-[#FF6B35] font-medium">
            Create one
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-[#B0B4BB] mt-7">
        Your diary is private and secure. Always.
      </p>
    </motion.div>
  )
}