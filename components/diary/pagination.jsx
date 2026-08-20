'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="icon"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={1.85} />
      </Button>

      {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
        const p = i + 1
        return (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`w-9 h-9 rounded-xl text-[13.5px] font-medium transition-all duration-300 ${
              p === page
                ? 'text-white'
                : 'text-[#6B6F78] hover:bg-[#FFF1E8] hover:text-[#FF7A45]'
            }`}
            style={p === page ? { background: 'linear-gradient(135deg,#FF7A45,#FF9A62)' } : undefined}
          >
            {p}
          </button>
        )
      })}

      <Button
        variant="outline"
        size="icon"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
      >
        <ChevronRight className="w-4 h-4" strokeWidth={1.85} />
      </Button>
    </div>
  )
}