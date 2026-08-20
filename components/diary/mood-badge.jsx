import { getMoodByValue } from '@/lib/utils'
import { cn } from '@/lib/utils'

/* NOTE: per-mood color still comes from getMoodByValue(mood).color in
   @/lib/utils (not seen), so individual mood hues are unchanged. If that
   file uses saturated tailwind pairs like bg-amber-100/text-amber-800,
   it'll clash with the rest of the app's soft-tint style — send it over
   and I can bring the mood palette in line too. */

export function MoodBadge({ mood, size = 'sm' }) {
  const m = getMoodByValue(mood)
  if (!m) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        m.color,
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-[12.5px]'
      )}
    >
      <span>{m.emoji}</span>
      <span>{m.label}</span>
    </span>
  )
}