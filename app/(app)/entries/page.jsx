'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { DiaryCard } from '@/components/diary/diary-card'
import { SearchBar } from '@/components/diary/search-bar'
import { EmptyState } from '@/components/diary/empty-state'
import { Pagination } from '@/components/diary/pagination'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/use-debounce'

/* Same tokens as the rest of the app:
   ink #17181C / #6B6F78 / #8A8E96, brand #FF7A45→#FF9A62, ring #ECE8DF */

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

export default function EntriesPage() {
  const [diaries, setDiaries] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [mood, setMood] = useState('')
  const [sort, setSort] = useState('newest')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const debouncedSearch = useDebounce(search, 400)

  const fetchDiaries = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: '12',
      sort,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(mood && { mood }),
    })
    try {
      const res = await fetch(`/api/diary?${params}`)
      const data = await res.json()
      setDiaries(data.diaries || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } finally {
      setLoading(false)
    }
  }, [page, sort, debouncedSearch, mood])

  useEffect(() => { fetchDiaries() }, [fetchDiaries])
  useEffect(() => { setPage(1) }, [debouncedSearch, mood, sort])

  function handleUpdate(updated) {
    setDiaries((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await fetch(`/api/diary/${deleteTarget.id}`, { method: 'DELETE' })
      setDiaries((prev) => prev.filter((d) => d.id !== deleteTarget.id))
      setTotal((t) => t - 1)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-[#17181C] tracking-tight">All entries</h1>
          {!loading && (
            <p className="text-[13.5px] text-[#8A8E96] mt-1">
              {total} {total === 1 ? 'entry' : 'entries'}
            </p>
          )}
        </div>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        mood={mood}
        onMoodChange={setMood}
        sort={sort}
        onSortChange={setSort}
        onClear={() => setSearch('')}
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <DiaryCardSkeleton key={i} />)}
        </div>
      ) : diaries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={search || mood ? 'No entries found' : 'Your diary is empty'}
          description={search || mood ? 'Try adjusting your filters' : 'Start capturing your thoughts and memories'}
          action={!search && !mood ? 'Write your first entry' : undefined}
          actionHref="/entries/new"
        />
      ) : (
        <>
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
          <Pagination page={page} pages={pages} onPage={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this entry?"
        description="This action cannot be undone. The entry will be permanently deleted."
      />
    </div>
  )
}