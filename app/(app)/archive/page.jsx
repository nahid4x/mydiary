'use client'

import { useEffect, useState, useCallback } from 'react'
import { Archive, RotateCcw, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { EmptyState } from '@/components/diary/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MoodBadge } from '@/components/diary/mood-badge'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { formatDateShort, truncate } from '@/lib/utils'

const easing = [0.22, 1, 0.36, 1]

function DiaryCardSkeleton() {
  return (
    <div className="bg-white/60 rounded-[20px] border border-[#ECE8DF] p-5 flex gap-4 animate-pulse">
      <div className="flex-1 space-y-3">
        <div className="h-3 w-24 bg-[#F1EFE9] rounded" />
        <div className="h-4 w-2/3 bg-[#F1EFE9] rounded" />
        <div className="h-3 w-full bg-[#F1EFE9] rounded" />
      </div>
    </div>
  )
}

function ArchivedCard({ diary, onRestore, onDelete }) {
  const [restoring, setRestoring] = useState(false)

  async function restore() {
    setRestoring(true)
    try {
      const res = await fetch(`/api/diary/${diary.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: false }),
      })
      const data = await res.json()
      onRestore(data.diary)
      toast({ title: 'Entry restored', variant: 'success' })
    } catch {
      toast({ title: 'Failed to restore', variant: 'error' })
    } finally {
      setRestoring(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: easing }}
      whileHover={{ y: -2 }}
      className="bg-white/70 backdrop-blur-md rounded-[20px] border border-[#ECE8DF] p-5 flex gap-4 hover:border-[#FF7A45]/25 hover:shadow-[0_20px_50px_-18px_rgba(23,24,28,0.14)] transition-all duration-300"
    >
      {diary.image && (
        <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
          <img src={diary.image} alt="" className="w-full h-full object-cover opacity-80" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-serif font-semibold text-[#17181C] text-[15.5px] truncate">{diary.title}</h3>
        <p className="text-[12px] text-[#B0B4BB] mt-0.5 mb-2">{formatDateShort(diary.entryDate)}</p>
        <p className="text-[13.5px] text-[#8A8E96] line-clamp-2 leading-relaxed">{truncate(diary.content, 120)}</p>
        {diary.mood && <div className="mt-2.5"><MoodBadge mood={diary.mood} /></div>}
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={restore}
          loading={restoring}
          className="gap-1.5 rounded-xl bg-[#FFF1E8] text-[#FF7A45] hover:bg-[#FFE4D3] border-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restore
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(diary)}
          className="text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200 gap-1.5 rounded-xl"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </Button>
      </div>
    </motion.div>
  )
}

export default function ArchivePage() {
  const [diaries, setDiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchArchived = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/diary?archived=true&limit=50')
      const data = await res.json()
      setDiaries(data.diaries || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchArchived() }, [fetchArchived])

  function handleRestore(updated) {
    setDiaries((prev) => prev.filter((d) => d.id !== updated.id))
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await fetch(`/api/diary/${deleteTarget.id}`, { method: 'DELETE' })
      setDiaries((prev) => prev.filter((d) => d.id !== deleteTarget.id))
      toast({ title: 'Entry permanently deleted', variant: 'success' })
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
        <h1 className="text-3xl font-serif font-semibold text-[#17181C] tracking-tight">Archive</h1>
        <p className="text-[13.5px] text-[#8A8E96] mt-1">
          {!loading && `${diaries.length} archived ${diaries.length === 1 ? 'entry' : 'entries'}`}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <DiaryCardSkeleton key={i} />)}
        </div>
      ) : diaries.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="Archive is empty"
          description="Archived entries appear here. They're hidden from your main diary view."
          action="Browse all entries"
          actionHref="/entries"
        />
      ) : (
        <div className="space-y-3">
          {diaries.map((d) => (
            <ArchivedCard key={d.id} diary={d} onRestore={handleRestore} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Permanently delete?"
        description="This entry will be gone forever. This cannot be undone."
        confirmLabel="Delete permanently"
      />
    </div>
  )
}