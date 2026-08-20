import Link from 'next/link'
import { motion } from 'framer-motion'
import { PenLine } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyState({ title, description, action, actionHref, icon: Icon = PenLine }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: '#FFF1E8' }}>
        <Icon className="w-8 h-8 text-[#FF7A45]" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-serif font-semibold text-[#17181C] mb-2">{title}</h3>
      <p className="text-[#8A8E96] text-[13.5px] max-w-xs mb-6 leading-relaxed">{description}</p>
      {action && actionHref && (
        <Link href={actionHref}>
          <Button>{action}</Button>
        </Link>
      )}
    </motion.div>
  )
}