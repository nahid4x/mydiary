'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MOODS } from '@/lib/utils'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const easing = [0.22, 1, 0.36, 1]

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-[12px] border transition-all duration-300 ${
        active
          ? 'text-white border-transparent'
          : 'bg-white/60 text-[#6B6F78] border-[#ECE8DF] hover:border-[#FF7A45]/30 hover:text-[#17181C]'
      }`}
      style={active ? { background: 'linear-gradient(135deg,#FF7A45,#FF9A62)' } : undefined}
    >
      {children}
    </button>
  )
}

export function SearchBar({ value, onChange, mood, onMoodChange, sort, onSortChange, onClear }) {
  const [showFilters, setShowFilters] = useState(false)

  const hasFilters = mood || sort !== 'newest'

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B4BB]" strokeWidth={1.85} />
          <Input
            placeholder="Search entries..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10"
          />
          {value && (
            <button
              onClick={onClear}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B0B4BB] hover:text-[#6B6F78] transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={1.85} />
            </button>
          )}
        </div>
        <Button
          variant={hasFilters ? 'secondary' : 'outline'}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          title="Filters"
        >
          <SlidersHorizontal className="w-4 h-4" strokeWidth={1.85} />
        </Button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: easing }}
            className="overflow-hidden"
          >
            <div className="bg-white/70 backdrop-blur-md rounded-[20px] border border-[#ECE8DF] p-4 space-y-3.5">
              <div className="flex flex-wrap gap-2">
                <span className="text-[11.5px] font-medium text-[#8A8E96] w-full">Filter by mood</span>
                <Chip active={!mood} onClick={() => onMoodChange('')}>All moods</Chip>
                {MOODS.map((m) => (
                  <Chip key={m.value} active={mood === m.value} onClick={() => onMoodChange(mood === m.value ? '' : m.value)}>
                    {m.emoji} {m.label}
                  </Chip>
                ))}
              </div>

              <div>
                <span className="text-[11.5px] font-medium text-[#8A8E96] block mb-2">Sort by</span>
                <div className="flex gap-2">
                  {[
                    { value: 'newest', label: 'Newest first' },
                    { value: 'oldest', label: 'Oldest first' },
                    { value: 'title', label: 'Title A–Z' },
                  ].map((opt) => (
                    <Chip key={opt.value} active={sort === opt.value} onClick={() => onSortChange(opt.value)}>
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}