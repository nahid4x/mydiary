'use client'

import { useToast } from '@/hooks/use-toast'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const easing = [0.22, 1, 0.36, 1]

export function Toaster() {
  const { toasts, dismiss } = useToast()

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-emerald-600" strokeWidth={1.85} />,
    error: <AlertCircle className="w-4 h-4 text-red-500" strokeWidth={1.85} />,
    default: <Info className="w-4 h-4 text-[#FF7A45]" strokeWidth={1.85} />,
  }

  const styles = {
    success: 'border-emerald-100 bg-emerald-50/95',
    error: 'border-red-100 bg-red-50/95',
    default: 'border-[#ECE8DF] bg-white/95',
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.25, ease: easing }}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 backdrop-blur-md ${
              styles[toast.variant] || styles.default
            }`}
            style={{ boxShadow: '0 20px 50px -18px rgba(23,24,28,0.2)' }}
          >
            <span className="mt-0.5 shrink-0">{icons[toast.variant] || icons.default}</span>
            <div className="flex-1 min-w-0">
              {toast.title && <p className="text-[13.5px] font-semibold text-[#17181C]">{toast.title}</p>}
              {toast.description && <p className="text-[13px] text-[#6B6F78] mt-0.5">{toast.description}</p>}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 text-[#B0B4BB] hover:text-[#6B6F78] transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={1.85} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}