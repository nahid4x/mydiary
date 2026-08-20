'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MoodBadge } from '@/components/diary/mood-badge'
import { truncate } from '@/lib/utils'
import Link from 'next/link'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const easing = [0.22, 1, 0.36, 1]

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)
  const [dayEntries, setDayEntries] = useState([])

  useEffect(() => {
    setLoading(true)
    fetch('/api/diary?limit=200')
      .then((r) => r.json())
      .then((data) => setEntries(data.diaries || []))
      .finally(() => setLoading(false))
  }, [])

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDate(null)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDate(null)
  }

  function getEntriesForDay(day) {
    const date = new Date(year, month, day)
    return entries.filter((e) => isSameDay(new Date(e.entryDate), date))
  }

  function handleDayClick(day) {
    const date = new Date(year, month, day)
    const dayEs = getEntriesForDay(day)
    setSelectedDate(date)
    setDayEntries(dayEs)
  }

  const today = new Date()

  return (
    <div className="space-y-7">
      <h1 className="text-3xl font-serif font-semibold text-[#17181C] tracking-tight">Calendar</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2">
          <div className="bg-white/70 backdrop-blur-md rounded-[22px] border border-[#ECE8DF] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECE8DF]">
              <button onClick={prevMonth} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[#FFF1E8] text-[#6B6F78] hover:text-[#FF7A45] transition-colors">
                <ChevronLeft className="w-4 h-4" strokeWidth={1.85} />
              </button>
              <h2 className="text-[16px] font-serif font-semibold text-[#17181C]">
                {MONTHS[month]} {year}
              </h2>
              <button onClick={nextMonth} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[#FFF1E8] text-[#6B6F78] hover:text-[#FF7A45] transition-colors">
                <ChevronRight className="w-4 h-4" strokeWidth={1.85} />
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 border-b border-[#ECE8DF]">
              {DAYS.map((d) => (
                <div key={d} className="py-2.5 text-center text-[11px] font-medium text-[#B0B4BB] tracking-wide">
                  {d}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7">
              {[...Array(firstDay)].map((_, i) => (
                <div key={`empty-${i}`} className="h-14 border-b border-r border-[#F4F2ED]" />
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1
                const dayEs = getEntriesForDay(day)
                const isToday = isSameDay(new Date(year, month, day), today)
                const isSelected = selectedDate && isSameDay(new Date(year, month, day), selectedDate)

                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`h-14 border-b border-r border-[#F4F2ED] flex flex-col items-center justify-start pt-2 gap-1 hover:bg-[#FFF8F3] transition-colors relative ${
                      isSelected ? 'bg-[#FFF1E8]' : ''
                    }`}
                  >
                    <span className={`text-[13px] font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                      isToday ? 'text-white' : isSelected ? 'text-[#FF7A45]' : 'text-[#3A3D45]'
                    }`}
                      style={isToday ? { background: 'linear-gradient(135deg,#FF7A45,#FF9A62)' } : undefined}
                    >
                      {day}
                    </span>
                    {dayEs.length > 0 && (
                      <div className="flex gap-0.5">
                        {dayEs.slice(0, 3).map((e) => (
                          <div key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF9A62' }} />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <p className="text-[12px] text-[#B0B4BB] mt-3 text-center">
            Click a date to see entries. Orange dots indicate diary entries.
          </p>
        </div>

        {/* Day detail panel */}
        <div>
          <AnimatePresence mode="wait">
            {selectedDate ? (
              <motion.div
                key={selectedDate.toISOString()}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, ease: easing }}
                className="space-y-3"
              >
                <h3 className="font-serif font-semibold text-[15px] text-[#17181C]">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>

                {dayEntries.length === 0 ? (
                  <div className="bg-white/60 rounded-[20px] border border-dashed border-[#ECE8DF] p-8 text-center">
                    <CalIcon className="w-7 h-7 text-[#D8D4C9] mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-[13px] text-[#B0B4BB] mb-3">No entries on this day</p>
                    <Link href={`/entries/new`}>
                      <Button size="sm" variant="secondary" className="rounded-xl">Write entry</Button>
                    </Link>
                  </div>
                ) : (
                  dayEntries.map((e) => (
                    <Link key={e.id} href={`/entries/${e.id}`}>
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="bg-white/70 backdrop-blur-md rounded-[18px] border border-[#ECE8DF] p-4 hover:border-[#FF7A45]/25 hover:shadow-[0_16px_40px_-16px_rgba(23,24,28,0.14)] transition-all duration-300"
                      >
                        <h4 className="font-medium text-[#17181C] text-[13.5px] mb-1 truncate">{e.title}</h4>
                        <p className="text-[12.5px] text-[#8A8E96] line-clamp-2 mb-2 leading-relaxed">{truncate(e.content, 100)}</p>
                        {e.mood && <MoodBadge mood={e.mood} />}
                      </motion.div>
                    </Link>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/60 rounded-[20px] border border-dashed border-[#ECE8DF] p-10 text-center"
              >
                <CalIcon className="w-9 h-9 text-[#E3DFD5] mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-[13px] text-[#B0B4BB]">Select a date to view entries</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}