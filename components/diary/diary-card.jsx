'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Archive, Trash2, Lock, Globe, MoreVertical } from 'lucide-react'
import { MoodBadge } from './mood-badge'
import { formatDateShort, truncate } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'

const easing = [0.22, 1, 0.36, 1]

export function DiaryCard({ diary, onUpdate, onDelete, readOnly = false, author }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState('')
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function toggleFavorite(e) {
    e.preventDefault()
    setLoading('fav')
    try {
      const res = await fetch(`/api/diary/${diary.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !diary.isFavorite }),
      })
      const data = await res.json()
      onUpdate?.(data.diary)
      toast({ title: diary.isFavorite ? 'Removed from favorites' : 'Added to favorites', variant: 'success' })
    } catch {
      toast({ title: 'Something went wrong', variant: 'error' })
    } finally {
      setLoading('')
      setMenuOpen(false)
    }
  }

  async function toggleArchive(e) {
    e.preventDefault()
    setLoading('archive')
    try {
      const res = await fetch(`/api/diary/${diary.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: !diary.isArchived }),
      })
      const data = await res.json()
      onUpdate?.(data.diary)
      toast({ title: diary.isArchived ? 'Entry restored' : 'Entry archived', variant: 'success' })
    } catch {
      toast({ title: 'Something went wrong', variant: 'error' })
    } finally {
      setLoading('')
      setMenuOpen(false)
    }
  }

  const tags = diary.tags?.map((dt) => dt.tag) || []
  const href = readOnly ? `/entries/${diary.id}?view=public` : `/entries/${diary.id}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: easing }}
      className="group relative"
    >
      <Link href={href}>
        <div className="bg-white/70 backdrop-blur-md rounded-[20px] border border-[#ECE8DF] p-5 hover:border-[#FF7A45]/25 hover:shadow-[0_20px_50px_-18px_rgba(23,24,28,0.16)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] h-full flex flex-col">
          {/* Image */}
          {diary.image && (
            <div className="rounded-2xl overflow-hidden mb-4 h-40 w-full">
              <img src={diary.image} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Author (public entries only) */}
          {author && (
            <div className="flex items-center gap-2 mb-3">
              {author.avatar ? (
                <img src={author.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#F1EFE9] flex items-center justify-center text-[9px] font-medium text-[#8A8E96]">
                  {author.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <span className="text-[11.5px] text-[#8A8E96]">{author.name}</span>
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-serif font-semibold text-[#17181C] text-[15.5px] leading-snug line-clamp-2 flex-1">
              {diary.title}
            </h3>
            {diary.isFavorite && !readOnly && (
              <Star className="w-4 h-4 text-[#FF7A45] fill-[#FF9A62] shrink-0 mt-0.5" />
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-2 text-[11.5px] text-[#B0B4BB] mb-3">
            <span>{formatDateShort(diary.entryDate)}</span>
            <span>·</span>
            {diary.privacy === 'public' ? (
              <Globe className="w-3 h-3" strokeWidth={1.85} />
            ) : (
              <Lock className="w-3 h-3" strokeWidth={1.85} />
            )}
          </div>

          {/* Content preview */}
          <p className="text-[13.5px] text-[#6B6F78] leading-relaxed flex-1 line-clamp-3">
            {truncate(diary.content, 160)}
          </p>

          {/* Footer */}
          <div className="flex items-center flex-wrap gap-1.5 mt-4">
            {diary.mood && <MoodBadge mood={diary.mood} />}
            {tags.slice(0, 2).map((tag) => (
              <span key={tag.id} className="px-2.5 py-0.5 rounded-full bg-[#F4F2ED] text-[#8A8E96] text-[11px]">
                #{tag.name}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-[11px] text-[#B0B4BB]">+{tags.length - 2}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Menu — hidden entirely for read-only (public) cards */}
      {!readOnly && (
        <div className="absolute top-3 right-3" ref={menuRef}>
          <button
            onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen) }}
            className="w-7 h-7 rounded-xl bg-white/90 border border-[#ECE8DF] shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
          >
            <MoreVertical className="w-4 h-4 text-[#8A8E96]" strokeWidth={1.85} />
          </button>

          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.18, ease: easing }}
              className="absolute right-0 top-9 z-20 bg-white rounded-2xl border border-[#ECE8DF] py-1.5 min-w-[168px]"
              style={{ boxShadow: '0 24px 50px -16px rgba(23,24,28,0.2)' }}
            >
              <button
                onClick={toggleFavorite}
                disabled={loading === 'fav'}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[13px] text-[#3A3D45] hover:bg-[#FFF1E8] hover:text-[#FF7A45] transition-colors"
              >
                <Star className="w-4 h-4" strokeWidth={1.85} />
                {diary.isFavorite ? 'Unfavorite' : 'Favorite'}
              </button>
              <button
                onClick={toggleArchive}
                disabled={loading === 'archive'}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[13px] text-[#3A3D45] hover:bg-[#FFF1E8] hover:text-[#FF7A45] transition-colors"
              >
                <Archive className="w-4 h-4" strokeWidth={1.85} />
                {diary.isArchived ? 'Restore' : 'Archive'}
              </button>
              <hr className="border-[#ECE8DF] my-1" />
              <button
                onClick={(e) => { e.preventDefault(); setMenuOpen(false); onDelete?.(diary) }}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.85} />
                Delete
              </button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  )
}