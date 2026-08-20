import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

/* Brand gradient #FF7A45 → #FF9A62, ink #17181C/#6B6F78, ring #ECE8DF —
   same tokens used across landing/login/dashboard/sidebar/navbar. */

const variants = {
  default:
    'text-white border-0 shadow-[0_8px_20px_-6px_rgba(255,122,69,0.4)] hover:shadow-[0_10px_24px_-6px_rgba(255,122,69,0.5)] hover:-translate-y-[1px] [background:linear-gradient(135deg,#FF7A45,#FF9A62)]',
  secondary:
    'bg-[#FFF1E8] text-[#FF7A45] border border-[#FF7A45]/10 hover:bg-[#FFE4D3]',
  outline:
    'border border-[#ECE8DF] bg-white/60 text-[#3A3D45] hover:bg-white hover:border-[#D8D4C9]',
  ghost:
    'text-[#6B6F78] hover:bg-white hover:text-[#17181C]',
  destructive:
    'bg-red-500 text-white hover:bg-red-600 shadow-sm',
  link:
    'text-[#FF7A45] hover:text-[#FF6B35] underline-offset-4 hover:underline',
}

const sizes = {
  sm: 'h-8 px-3 text-sm rounded-xl gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-2xl gap-2',
  icon: 'h-9 w-9 rounded-xl',
}

export function Button({
  children,
  variant = 'default',
  size = 'md',
  className,
  loading,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7A45]/20 disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}