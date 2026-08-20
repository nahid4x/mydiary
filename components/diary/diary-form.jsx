'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image as ImageIcon, X, Tag, Star, Globe, Lock,
  ChevronDown, Loader2, Save, Sparkles, Check, Undo2,
} from 'lucide-react'
import { diarySchema } from '@/lib/validations'
import { MOODS, WEATHER_OPTIONS } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { useAiImprove } from '@/hooks/use-ai-improve'

const easing = [0.22, 1, 0.36, 1]

const AI_MODES = [
  { value: 'grammar', label: 'Fix Grammar' },
  { value: 'improve', label: 'Improve Writing' },
  { value: 'structure', label: 'Organize Thoughts' },
  { value: 'clear', label: 'Make Clearer' },
  { value: 'shorten', label: 'Make Shorter' },
  { value: 'expand', label: 'Expand' },
]

function MetaButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 h-8 px-3 rounded-xl border text-[12px] transition-all duration-300 ${
        active
          ? 'border-[#FF7A45]/25 bg-[#FFF1E8] text-[#FF7A45]'
          : 'border-[#ECE8DF] text-[#6B6F78] hover:border-[#FF7A45]/25 hover:text-[#17181C]'
      }`}
    >
      {children}
    </button>
  )
}

export function DiaryForm({ initialData, isEdit }) {
  const router = useRouter()
  const fileRef = useRef(null)

  const [imagePreview, setImagePreview] = useState(initialData?.image || null)
  const [imageUrl, setImageUrl] = useState(initialData?.image || null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedMood, setSelectedMood] = useState(initialData?.mood || '')
  const [selectedWeather, setSelectedWeather] = useState(initialData?.weather || '')
  const [isFavorite, setIsFavorite] = useState(initialData?.isFavorite || false)
  const [isArchived, setIsArchived] = useState(initialData?.isArchived || false)
  const [privacy, setPrivacy] = useState(initialData?.privacy || 'private')
  const [tagInput, setTagInput] = useState(
    initialData?.tags?.map((dt) => dt.tag?.name || dt.name).join(', ') || ''
  )
  const [saving, setSaving] = useState(false)
  const [showMoodPicker, setShowMoodPicker] = useState(false)
  const [showWeatherPicker, setShowWeatherPicker] = useState(false)

  // AI Assist state
  const [showAiMenu, setShowAiMenu] = useState(false)
  const [showAiPreview, setShowAiPreview] = useState(false)
  const [lastOriginal, setLastOriginal] = useState('')
  const { improve, loading: aiLoading, result: aiResult, error: aiError, reset: resetAi } = useAiImprove()

  const defaultDate = initialData?.entryDate
    ? new Date(initialData.entryDate).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 16)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(diarySchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      mood: initialData?.mood || '',
      weather: initialData?.weather || '',
      privacy: initialData?.privacy || 'private',
      tags: initialData?.tags?.map((dt) => dt.tag?.name || dt.name).join(', ') || '',
      entryDate: defaultDate,
    },
  })

  const contentValue = watch('content')
  const wordCount = contentValue ? contentValue.trim().split(/\s+/).filter(Boolean).length : 0

  async function handleAiMode(mode) {
    setShowAiMenu(false)
    if (!contentValue || !contentValue.trim()) {
      toast({ title: 'Write something first', variant: 'error' })
      return
    }
    setLastOriginal(contentValue)
    const data = await improve(contentValue, mode)
    if (data) {
      setShowAiPreview(true)
    } else {
      toast({ title: aiError || "AI couldn't improve this entry right now.", description: 'Your original writing is safe.', variant: 'error' })
    }
  }

  function applyAiChanges() {
    if (aiResult?.improvedText) {
      setValue('content', aiResult.improvedText, { shouldDirty: true })
    }
    setShowAiPreview(false)
    resetAi()
    toast({ title: 'AI changes applied', variant: 'success' })
  }

  function cancelAiChanges() {
    setShowAiPreview(false)
    resetAi()
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image too large', description: 'Max 5MB allowed', variant: 'error' })
      return
    }
    setImagePreview(URL.createObjectURL(file))
    setUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'diary')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      setImageUrl(data.url)
      toast({ title: 'Image uploaded', variant: 'success' })
    } catch {
      toast({ title: 'Image upload failed', variant: 'error' })
      setImagePreview(null)
    } finally {
      setUploadingImage(false)
    }
  }

  async function onSubmit(values) {
    setSaving(true)
    const payload = {
      ...values,
      mood: selectedMood,
      weather: selectedWeather,
      privacy,
      tags: tagInput,
      image: imageUrl,
      ...(isEdit && { isFavorite, isArchived }),
    }

    try {
      const url = isEdit ? `/api/diary/${initialData.id}` : '/api/diary'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save')
      }

      const data = await res.json()
      toast({ title: isEdit ? 'Entry updated' : 'Entry created', variant: 'success' })
      router.push(`/entries/${data.diary.id}`)
      router.refresh()
    } catch (err) {
      toast({ title: err.message || 'Something went wrong', variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white/70 backdrop-blur-md rounded-[28px] border border-[#ECE8DF] p-7 md:p-10 space-y-7"
      style={{ boxShadow: '0 30px 80px -30px rgba(23,24,28,0.12)' }}
    >
      {/* Title */}
      <div>
        <Input
          {...register('title')}
          placeholder="Give your entry a title..."
          className="text-[26px] font-serif font-semibold h-14 text-[#17181C] placeholder:text-[#D8D4C9] placeholder:font-normal border-0 border-b border-[#ECE8DF] rounded-none px-0 focus:ring-0 focus:border-[#FF7A45]/50 bg-transparent"
          error={!!errors.title}
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-2.5 pb-6 border-b border-[#ECE8DF]">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#B0B4BB] font-medium">Date</span>
          <Input
            type="datetime-local"
            {...register('entryDate')}
            className="h-8 text-[12px] px-2.5 w-auto rounded-xl"
          />
        </div>

        <div className="relative">
          <MetaButton active={!!selectedMood} onClick={() => { setShowMoodPicker(!showMoodPicker); setShowWeatherPicker(false) }}>
            {selectedMood ? (
              <>{MOODS.find((m) => m.value === selectedMood)?.emoji} {MOODS.find((m) => m.value === selectedMood)?.label}</>
            ) : (
              <>😊 Mood</>
            )}
            <ChevronDown className="w-3 h-3" strokeWidth={1.85} />
          </MetaButton>
          {showMoodPicker && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.18, ease: easing }}
              className="absolute top-10 left-0 z-20 bg-white border border-[#ECE8DF] rounded-2xl p-3 grid grid-cols-4 gap-1 w-56"
              style={{ boxShadow: '0 24px 50px -16px rgba(23,24,28,0.2)' }}
            >
              <button
                type="button"
                onClick={() => { setSelectedMood(''); setShowMoodPicker(false) }}
                className="col-span-4 text-[11.5px] text-[#B0B4BB] hover:text-[#6B6F78] pb-1.5 border-b border-[#F1EFE9] mb-1"
              >
                Clear mood
              </button>
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => { setSelectedMood(m.value); setShowMoodPicker(false) }}
                  title={m.label}
                  className={`text-xl p-2 rounded-xl hover:bg-[#FFF1E8] transition-colors ${selectedMood === m.value ? 'bg-[#FFF1E8]' : ''}`}
                >
                  {m.emoji}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <div className="relative">
          <MetaButton active={!!selectedWeather} onClick={() => { setShowWeatherPicker(!showWeatherPicker); setShowMoodPicker(false) }}>
            {selectedWeather ? (
              <>{WEATHER_OPTIONS.find((w) => w.value === selectedWeather)?.emoji} {WEATHER_OPTIONS.find((w) => w.value === selectedWeather)?.label}</>
            ) : (
              <>☀️ Weather</>
            )}
            <ChevronDown className="w-3 h-3" strokeWidth={1.85} />
          </MetaButton>
          {showWeatherPicker && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.18, ease: easing }}
              className="absolute top-10 left-0 z-20 bg-white border border-[#ECE8DF] rounded-2xl p-3 grid grid-cols-4 gap-1 w-56"
              style={{ boxShadow: '0 24px 50px -16px rgba(23,24,28,0.2)' }}
            >
              <button
                type="button"
                onClick={() => { setSelectedWeather(''); setShowWeatherPicker(false) }}
                className="col-span-4 text-[11.5px] text-[#B0B4BB] hover:text-[#6B6F78] pb-1.5 border-b border-[#F1EFE9] mb-1"
              >
                Clear weather
              </button>
              {WEATHER_OPTIONS.map((w) => (
                <button
                  key={w.value}
                  type="button"
                  onClick={() => { setSelectedWeather(w.value); setShowWeatherPicker(false) }}
                  title={w.label}
                  className={`text-xl p-2 rounded-xl hover:bg-[#FFF1E8] transition-colors ${selectedWeather === w.value ? 'bg-[#FFF1E8]' : ''}`}
                >
                  {w.emoji}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <MetaButton onClick={() => setPrivacy(privacy === 'private' ? 'public' : 'private')}>
          {privacy === 'private' ? <Lock className="w-3 h-3" strokeWidth={1.85} /> : <Globe className="w-3 h-3" strokeWidth={1.85} />}
          {privacy === 'private' ? 'Private' : 'Public'}
        </MetaButton>

        <MetaButton active={isFavorite} onClick={() => setIsFavorite(!isFavorite)}>
          <Star className={`w-3 h-3 ${isFavorite ? 'fill-[#FF9A62] text-[#FF7A45]' : ''}`} strokeWidth={1.85} />
          {isFavorite ? 'Favorited' : 'Favorite'}
        </MetaButton>
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-2 relative">
          <span className="text-[11px] text-[#B0B4BB] font-medium">Your entry</span>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAiMenu(!showAiMenu)}
              disabled={aiLoading}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-[#FF7A45]/25 bg-[#FFF1E8] text-[#FF7A45] text-[12px] font-medium hover:bg-[#FFE7D6] transition-colors disabled:opacity-60"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Improving your writing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={1.85} />
                  AI Assist
                </>
              )}
            </button>

            <AnimatePresence>
              {showAiMenu && !aiLoading && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: easing }}
                  className="absolute top-10 right-0 z-20 bg-white border border-[#ECE8DF] rounded-2xl p-2 w-52"
                  style={{ boxShadow: '0 24px 50px -16px rgba(23,24,28,0.2)' }}
                >
                  <div className="px-2.5 py-1.5 text-[11px] text-[#B0B4BB] font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> AI Writing Assistant
                  </div>
                  {AI_MODES.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => handleAiMode(m.value)}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-[13px] text-[#3A3D45] hover:bg-[#FFF1E8] hover:text-[#FF7A45] transition-colors"
                    >
                      {m.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <Textarea
          {...register('content')}
          placeholder="Write your thoughts... let it flow."
          className="min-h-[320px] text-[15.5px] leading-[1.85] border-0 rounded-none px-0 focus:ring-0 bg-transparent resize-none font-sans text-[#3A3D45] placeholder:text-[#D8D4C9]"
          error={!!errors.content}
        />
        <div className="flex items-center justify-between mt-2">
          {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
          <span className="text-[11.5px] text-[#B0B4BB] ml-auto tabular-nums">{wordCount} words</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2.5 py-4 border-t border-[#ECE8DF]">
        <Tag className="w-4 h-4 text-[#B0B4BB] shrink-0" strokeWidth={1.85} />
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="Add tags, separated by commas (e.g. travel, work, thoughts)"
          className="border-0 px-0 focus:ring-0 text-[13.5px] bg-transparent h-8"
        />
      </div>

      {/* Image upload */}
      <div className="border-t border-[#ECE8DF] pt-5">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        {imagePreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-[#ECE8DF]">
            <img
              src={imagePreview}
              alt="Entry image"
              className="w-full max-h-64 object-cover"
            />
            {uploadingImage && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#FF7A45]" />
              </div>
            )}
            <button
              type="button"
              onClick={() => { setImagePreview(null); setImageUrl(null) }}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[#17181C]/50 text-white flex items-center justify-center hover:bg-[#17181C]/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 text-[13.5px] text-[#8A8E96] hover:text-[#FF7A45] transition-colors"
          >
            <ImageIcon className="w-4 h-4" strokeWidth={1.85} />
            Add a photo to this entry
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-5 border-t border-[#ECE8DF]">
        <Button type="button" variant="ghost" onClick={() => router.back()} size="sm">
          Cancel
        </Button>
        <Button type="submit" loading={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Save entry'}
        </Button>
      </div>

      {/* AI Preview Modal */}
      <AnimatePresence>
        {showAiPreview && aiResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#17181C]/40 backdrop-blur-sm p-4"
            onClick={cancelAiChanges}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.2, ease: easing }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[24px] border border-[#ECE8DF] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-7"
              style={{ boxShadow: '0 40px 100px -30px rgba(23,24,28,0.3)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#FF7A45]" />
                <h3 className="text-[17px] font-serif font-semibold text-[#17181C]">AI Improved Version</h3>
              </div>
              {aiResult.changes?.length > 0 && (
                <ul className="text-[12px] text-[#8A8E96] mt-2 mb-5 space-y-1">
                  {aiResult.changes.map((c, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-[#FF7A45]" /> {c}
                    </li>
                  ))}
                </ul>
              )}

              <div className="space-y-4">
                <div>
                  <div className="text-[11px] text-[#B0B4BB] font-medium mb-1.5">Original</div>
                  <div className="text-[13.5px] leading-[1.7] text-[#8A8E96] bg-[#FAF9F6] rounded-2xl p-4 border border-[#ECE8DF] whitespace-pre-wrap">
                    {lastOriginal}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#FF7A45] font-medium mb-1.5">AI Version</div>
                  <div className="text-[13.5px] leading-[1.7] text-[#3A3D45] bg-[#FFF1E8] rounded-2xl p-4 border border-[#FF7A45]/20 whitespace-pre-wrap">
                    {aiResult.improvedText}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-6 pt-5 border-t border-[#ECE8DF]">
                <Button type="button" variant="ghost" size="sm" onClick={cancelAiChanges} className="gap-1.5">
                  <Undo2 className="w-3.5 h-3.5" /> Cancel
                </Button>
                <Button type="button" size="sm" onClick={applyAiChanges} className="gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Apply Changes
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}