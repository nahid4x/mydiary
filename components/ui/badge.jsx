import { cn } from '@/lib/utils'

/* Same tokens as Button/cards — soft tint chips, no harsh saturated fills. */

const variants = {
  default: 'bg-[#F4F2ED] text-[#6B6F78] border-[#ECE8DF]',
  amber: 'bg-[#FFF1E8] text-[#FF7A45] border-[#FF7A45]/10',
  green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  red: 'bg-red-50 text-red-500 border-red-100',
  purple: 'bg-violet-50 text-violet-600 border-violet-100',
  blue: 'bg-sky-50 text-sky-600 border-sky-100',
}

export function Badge({ children, variant = 'default', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}