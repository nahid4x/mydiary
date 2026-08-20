import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const Input = forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl border bg-white/70 px-3.5 py-2 text-[14px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'border-[#ECE8DF] placeholder:text-[#B0B4BB] text-[#17181C]',
        'focus:outline-none focus:border-[#FF7A45]/50 focus:ring-4 focus:ring-[#FF7A45]/10',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-red-300 focus:ring-red-100 focus:border-red-400',
        className
      )}
      {...props}
    />
  )
})
Input.displayName = 'Input'
export { Input }