'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  BookOpen, Star, Archive, PenLine, Flame, Sparkles,
  Calendar, Search, Shuffle, Shield, Check,
} from 'lucide-react'
import { DiaryCard } from '@/components/diary/diary-card'
import { getMoodByValue } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/* ---------------------------------------------------------
   Shares the design language of the login/landing pages:
   bg        #FFFCFA / #FCFBF8
   ink       #17181C (headings) / #6B6F78 (body) / #8A8E96 (muted)
   orange    #FF7A45 → #FF9A62
   violet    #8B7CF6 (mood accent)
   ring      #ECE8DF (hairline borders)
--------------------------------------------------------- */

const QUOTES = [
  'Small moments become the biggest memories.',
  "Write it down while it's still warm.",
  'The unexamined day is not worth living.',
  "Your future self will thank you for today's words.",
]

const easing = [0.22, 1, 0.36, 1]

function StatTile({ icon: Icon, label, value, sub, delay, href }) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: easing }}
        whileHover={{ y: -3 }}
        className="group relative bg-white/70 backdrop-blur-md rounded-[22px] border border-[#ECE8DF] px-6 py-5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_20px_50px_-18px_rgba(23,24,28,0.16)] hover:border-[#FF7A45]/25"
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#FFF1E8' }}
          >
            <Icon className="w-4.5 h-4.5 text-[#FF7A45]" strokeWidth={1.75} />
          </div>
        </div>
        <p className="text-3xl font-serif font-semibold text-[#17181C] tracking-tight tabular-nums">
          {value ?? '—'}
        </p>
        <p className="text-[13px] text-[#8A8E96] mt-1">{label}</p>
        {sub && <p className="text-[12px] text-[#B0B4BB] mt-0.5">{sub}</p>}
      </motion.div>
    </Link>
  )
}

function QuickAction({ icon: Icon, label, desc, href, delay }) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: easing }}
        whileHover={{ y: -2 }}
        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/60 border border-[#ECE8DF] hover:border-[#FF7A45]/25 hover:bg-white transition-all duration-300"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF1E8' }}>
          <Icon className="w-4 h-4 text-[#FF7A45]" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[13.5px] font-medium text-[#17181C] leading-tight">{label}</p>
          <p className="text-[11.5px] text-[#8A8E96] leading-tight mt-0.5 truncate">{desc}</p>
        </div>
      </motion.div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-[24px] border border-dashed border-[#ECE8DF] p-12 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#FFF1E8' }}>
        <Sparkles className="w-6 h-6 text-[#FF7A45]" strokeWidth={1.75} />
      </div>
      <p className="text-[#17181C] font-serif text-lg mb-1">A blank page, waiting</p>
      <p className="text-[#8A8E96] text-sm mb-6">Nothing written yet. Start your first entry.</p>
      <Link href="/entries/new">
        <Button className="gap-2">
          <PenLine className="w-4 h-4" />
          Write your first entry
        </Button>
      </Link>
    </div>
  )
}

function DiaryCardSkeleton() {
  return (
    <div className="bg-white/60 rounded-[20px] border border-[#ECE8DF] p-5 animate-pulse">
      <div className="h-3 w-24 bg-[#F1EFE9] rounded mb-3" />
      <div className="h-4 w-2/3 bg-[#F1EFE9] rounded mb-3" />
      <div className="h-3 w-full bg-[#F1EFE9] rounded mb-2" />
      <div className="h-3 w-4/5 bg-[#F1EFE9] rounded" />
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const quote = QUOTES[new Date().getDate() % QUOTES.length]
  const streak = stats?.streak ?? 0
  const firstName = session?.user?.name?.split(' ')[0]
  const latest = stats?.recent?.[0]

  return (
    <div className="relative">
      {/* Ambient light — same system as landing/login */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[34rem] h-[34rem] rounded-full bg-[#FF9A62]/[0.12] blur-[140px]" />
        <div className="absolute top-10 -right-24 w-[28rem] h-[28rem] rounded-full bg-[#8B7CF6]/[0.08] blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage: 'radial-gradient(circle,#00000006 1px,transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse 60% 45% at 50% 0%, black 15%, transparent 65%)',
          }}
        />
      </div>

      <div className="space-y-10 pb-8">
        {/* Hero */}
        <section
          className="grid gap-10 items-start"
          style={{ gridTemplateColumns: 'minmax(0,1fr) 420px' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easing }}
          >
            <p className="text-[13px] font-medium text-[#FF7A45] mb-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif font-semibold text-[#17181C] tracking-tight leading-[1.05]">
              {greeting}{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="text-[#6B6F78] mt-4 text-[15.5px] italic leading-relaxed max-w-md">
              &ldquo;{quote}&rdquo;
            </p>

            <div className="flex flex-wrap items-center gap-2.5 mt-6">
              {streak > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#FF7A45] bg-[#FFF1E8] px-3.5 py-1.5 rounded-full border border-[#FF7A45]/10">
                  <Flame className="w-3.5 h-3.5" /> {streak}-day streak
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-[13px] text-[#8A8E96] bg-white/60 px-3.5 py-1.5 rounded-full border border-[#ECE8DF]">
                <Shield className="w-3.5 h-3.5 text-[#FF7A45]" /> Private &amp; encrypted
              </span>
            </div>

            <Link href="/entries/new" className="inline-block mt-8">
              <Button className="gap-2 h-[50px] px-7 rounded-2xl text-[15px] font-semibold">
                <PenLine className="w-4 h-4" />
                Write today&apos;s entry
              </Button>
            </Link>
          </motion.div>

          {/* Floating journal preview — mirrors the landing hero card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: easing }}
            className="relative hidden md:block"
          >
            <div
              className="relative z-[2] rounded-[22px] overflow-hidden animate-[floatSoft_9s_ease-in-out_infinite] transition-transform duration-500 hover:!scale-[1.01]"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(23,24,28,0.07)',
                boxShadow: '0 24px 50px -14px rgba(23,24,28,0.18), 0 4px 12px rgba(23,24,28,0.06)',
              }}
            >
              <div className="flex items-center gap-2.5 px-6 pt-5 pb-4">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#FF7A45,#FF9A62)' }}>
                  <PenLine className="w-3 h-3 text-white" strokeWidth={2.25} />
                </div>
                <p className="text-[11px] text-[#B0B4BB]">
                  {latest ? 'Your latest entry' : 'Start writing'}
                </p>
              </div>
              <div className="border-t border-[#F1EFE9]" />
              <div className="px-6 pt-5 pb-6">
                <h3 className="font-serif text-[19px] text-[#17181C] leading-snug mb-3">
                  {latest?.title || 'A quiet moment, waiting to be written'}
                </h3>
                <p className="text-[13.5px] text-[#6B6F78] leading-[1.8] line-clamp-3">
                  {latest?.content || 'Whatever today held — write it down before it fades. Your future self will be grateful you did.'}
                </p>
              </div>
              <div className="border-t border-[#F1EFE9]" />
              <div className="flex items-center gap-4 px-6 py-3.5 text-[11.5px] text-[#8A8E96]">
                <span className="flex items-center gap-1.5 text-[#4CD37E] font-medium">
                  <Check className="w-3.5 h-3.5" /> Auto-saved
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile icon={BookOpen} label="Entries" value={stats?.total} sub="Last written today" delay={0} href="/entries" />
          <StatTile icon={Star} label="Favorites" value={stats?.favorites} sub="Most loved memories" delay={0.05} href="/favorites" />
          <StatTile icon={Flame} label="Current streak" value={streak ? `${streak} days` : '0 days'} sub="Keep it alive" delay={0.1} href="/entries" />
          <StatTile icon={Archive} label="Archive" value={stats?.archived} sub="Safely stored" delay={0.15} href="/archive" />
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent entries */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-semibold text-[#17181C]">Recent entries</h2>
              <Link href="/entries" className="text-[13px] text-[#FF7A45] hover:text-[#FF6B35] font-medium transition-colors">
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <DiaryCardSkeleton key={i} />)}
              </div>
            ) : stats?.recent?.length > 0 ? (
              <div className="space-y-3">
                {stats.recent.map((d, i) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, ease: easing }}
                    whileHover={{ y: -2 }}
                    className="rounded-[20px] overflow-hidden"
                  >
                    <DiaryCard diary={d} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>

          {/* Mood + quick actions */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-semibold text-[#17181C] mb-4">Mood overview</h2>
              <div className="bg-white/70 backdrop-blur-md rounded-[22px] border border-[#ECE8DF] p-6">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#F1EFE9] animate-pulse" />
                        <div className="flex-1 h-1.5 bg-[#F1EFE9] rounded-full animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : stats?.moodStats?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.moodStats
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 6)
                      .map((m, i) => {
                        const mood = getMoodByValue(m.mood)
                        const max = Math.max(...stats.moodStats.map((x) => x.count))
                        if (!mood) return null
                        return (
                          <div key={m.mood} className="flex items-center gap-3">
                            <span className="text-lg w-6 text-center">{mood.emoji}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[12.5px] text-[#6B6F78]">{mood.label}</span>
                                <span className="text-[12.5px] font-medium text-[#17181C] tabular-nums">{m.count}</span>
                              </div>
                              <div className="h-1.5 bg-[#F1EFE9] rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(m.count / max) * 100}%` }}
                                  transition={{ duration: 0.7, delay: 0.1 + i * 0.05, ease: easing }}
                                  className="h-full rounded-full"
                                  style={{ background: 'linear-gradient(90deg,#FF7A45,#FF9A62)' }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#8A8E96] text-center py-4">
                    Add moods to your entries to see them here
                  </p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-serif font-semibold text-[#17181C] mb-4">Quick actions</h2>
              <div className="space-y-2.5">
                <QuickAction icon={PenLine} label="Write today" desc="Start a fresh entry" href="/entries/new" delay={0} />
                <QuickAction icon={Calendar} label="Calendar" desc="Browse day by day" href="/calendar" delay={0.05} />
                <QuickAction icon={Star} label="Favorites" desc="Your most loved memories" href="/favorites" delay={0.1} />
                <QuickAction icon={Search} label="Search" desc="Find anything you wrote" href="/entries" delay={0.15} />
                {stats?.recent?.length > 0 && (
                  <QuickAction icon={Shuffle} label="Random memory" desc="Revisit something old" href={`/entries/${stats.recent[Math.floor(Math.random() * stats.recent.length)]?.id}`} delay={0.2} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatSoft {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @media (max-width: 900px) {
          section:first-child { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  )
}