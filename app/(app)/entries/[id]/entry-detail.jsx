'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Edit2, Trash2, Star, Archive, ArrowLeft, Globe, Lock, Calendar } from 'lucide-react'
import { MoodBadge } from '@/components/diary/mood-badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { formatDate, formatTime, getWeatherByValue } from '@/lib/utils'

export function EntryDetail({ diary: initial, isOwner = true }) {
  const router = useRouter()
  const [diary, setDiary] = useState(initial)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState('')

  useEffect(() => {
    setDiary(initial)
  }, [initial])

  const tags = diary.tags?.map((dt) => dt.tag) || []
  const weather = getWeatherByValue(diary.weather)
  const author = diary.user

  async function toggle(field) {
    setToggling(field)
    try {
      const res = await fetch(`/api/diary/${diary.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !diary[field] }),
      })
      const data = await res.json()
      setDiary(data.diary)
      if (field === 'isFavorite') toast({ title: data.diary.isFavorite ? 'Added to favorites' : 'Removed from favorites', variant: 'success' })
      if (field === 'isArchived') {
        toast({ title: data.diary.isArchived ? 'Entry archived' : 'Entry restored', variant: 'success' })
        if (data.diary.isArchived) router.push('/entries')
      }
    } catch {
      toast({ title: 'Something went wrong', variant: 'error' })
    } finally {
      setToggling('')
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/diary/${diary.id}`, { method: 'DELETE' })
      toast({ title: 'Entry deleted', variant: 'success' })
      router.push('/entries')
    } catch {
      toast({ title: 'Failed to delete', variant: 'error' })
      setDeleting(false)
      setShowDelete(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link href="/entries" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to entries
        </Link>

        {isOwner ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggle('isFavorite')}
              loading={toggling === 'isFavorite'}
              className={diary.isFavorite ? 'border-amber-400 bg-amber-50 text-amber-700' : ''}
            >
              <Star className={`w-4 h-4 ${diary.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              {diary.isFavorite ? 'Favorited' : 'Favorite'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggle('isArchived')}
              loading={toggling === 'isArchived'}
            >
              <Archive className="w-4 h-4" />
              {diary.isArchived ? 'Restore' : 'Archive'}
            </Button>
            <Link href={`/entries/${diary.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setShowDelete(true)} className="text-red-500 hover:bg-red-50 hover:border-red-200">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          author && (
            <div className="flex items-center gap-2">
              {author.avatar ? (
                <img src={author.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500">
                  {author.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <span className="text-sm text-gray-500">{author.name}</span>
            </div>
          )
        )}
      </div>

      {/* Entry card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Image */}
        {diary.image && (
          <div className="w-full h-64 overflow-hidden">
            <img src={diary.image} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 leading-tight mb-4">
            {diary.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {formatDate(diary.entryDate)}
            </div>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">{formatTime(diary.entryDate)}</span>
            {diary.privacy === 'public' ? (
              <span className="flex items-center gap-1 text-xs text-gray-400"><Globe className="w-3 h-3" />Public</span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-gray-400"><Lock className="w-3 h-3" />Private</span>
            )}
            {diary.mood && <MoodBadge mood={diary.mood} />}
            {weather && (
              <span className="text-sm">{weather.emoji} {weather.label}</span>
            )}
          </div>

          {/* Content */}
          <div className="diary-content text-gray-800 leading-relaxed">
            {diary.content}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
              {tags.map((tag) => (
                <span key={tag.id} className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
            Created {formatDate(diary.createdAt)}
            {diary.updatedAt !== diary.createdAt && ` · Edited ${formatDate(diary.updatedAt)}`}
          </div>
        </div>
      </div>

      {isOwner && (
        <ConfirmDialog
          open={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          loading={deleting}
          title="Delete this entry?"
          description="This action cannot be undone. The entry will be permanently deleted."
        />
      )}
    </motion.div>
  )
}