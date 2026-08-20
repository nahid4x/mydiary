import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  const [total, favorites, archived, moodCounts, recent] = await Promise.all([
    prisma.diary.count({ where: { userId, isArchived: false } }),
    prisma.diary.count({ where: { userId, isFavorite: true, isArchived: false } }),
    prisma.diary.count({ where: { userId, isArchived: true } }),
    prisma.diary.groupBy({
      by: ['mood'],
      where: { userId, isArchived: false, mood: { not: null } },
      _count: { mood: true },
    }),
    prisma.diary.findMany({
      where: { userId, isArchived: false },
      orderBy: { entryDate: 'desc' },
      take: 5,
      include: { tags: { include: { tag: true } } },
    }),
  ])

  const moodStats = moodCounts.map((m) => ({ mood: m.mood, count: m._count.mood }))

  return NextResponse.json({ total, favorites, archived, moodStats, recent })
}
