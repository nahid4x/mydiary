'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { DiaryCard } from '@/components/diary/diary-card'
import { EmptyState } from '@/components/diary/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from '@/hooks/use-toast'

function DiaryCardSkeleton() {
  return (
    <div className="bg-white/60 rounded-[20px] border border-[#ECE8DF] p-5 animate-pulse">
      <div className="h-3 w-20 bg-[#F1EFE9] rounded mb-3" />
      <div className="h-4 w-2/3 bg-[#F1EFE9] rounded mb-3" />
      <div className="h-3 w-full bg-[#F1EFE9] rounded mb-2" />
      <div className="h-3 w-4/5 bg-[#F1EFE9] rounded" />
    </div>
  )
}

export default function FavoritesPage() {
  const [diaries, setDiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchFavorites = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/diary?favorite=true&limit=50')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      // Only keep entries where isFavorite is explicitly true
      const favorites = (data.diaries || []).filter((d) => d.isFavorite === true)
      setDiaries(favorites)
    } catch (err) {
      setError('Unable to load your favorites. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFavorites() }, [fetchFavorites])

  function handleUpdate(updated) {
    if (!updated.isFavorite) {
      // Unfavorited — remove immediately from list
      setDiaries((prev) => prev.filter((d) => d.id !== updated.id))
    } else {
      // Still favorited — update in place
      setDiaries((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/diary/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setDiaries((prev) => prev.filter((d) => d.id !== deleteTarget.id))
      toast({ title: 'Entry deleted', variant: 'success' })
    } catch {
      toast({ title: 'Failed to delete', variant: 'error' })
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-[#17181C] tracking-tight">Favorites</h1>
        {!loading && !error && (
          <p className="text-[13.5px] text-[#8A8E96] mt-1">
            {diaries.length} starred {diaries.length === 1 ? 'entry' : 'entries'}
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <DiaryCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="bg-white/60 rounded-[20px] border border-[#ECE8DF] p-10 text-center">
          <p className="text-[#8A8E96] text-[14px]">{error}</p>
          <button
            onClick={fetchFavorites}
            className="mt-4 text-[13px] text-[#FF7A45] hover:underline font-medium"
          >
            Try again
          </button>
        </div>
      ) : diaries.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No favorites yet"
          description="Star any diary entry to find it here quickly."
          action="Browse all entries"
          actionHref="/entries"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {diaries.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2 }}
              className="rounded-[20px] overflow-hidden"
            >
              <DiaryCard diary={d} onUpdate={handleUpdate} onDelete={setDeleteTarget} />
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this entry?"
        description="This action cannot be undone."
      />
    </div>
  )
}