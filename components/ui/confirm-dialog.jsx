'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { Button } from './button'

const easing = [0.22, 1, 0.36, 1]

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Delete', loading }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#17181C]/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: easing }}
            className="relative bg-white rounded-[24px] p-7 w-full max-w-sm"
            style={{
              border: '1px solid #ECE8DF',
              boxShadow: '0 30px 70px -20px rgba(23,24,28,0.25)',
            }}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5.5 h-5.5 text-red-500" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-[17px] font-serif font-semibold text-[#17181C]">{title}</h2>
                <p className="text-[13.5px] text-[#8A8E96] mt-1.5 leading-relaxed">{description}</p>
              </div>
              <div className="flex gap-2.5 w-full mt-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1 rounded-xl" onClick={onConfirm} loading={loading}>
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}