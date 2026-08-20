import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Triggered by an external scheduler (e.g. Vercel Cron) once a day.
// Protect with a shared secret so this can't be hit by randoms.
export async function GET(req) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dueUsers = await prisma.user.findMany({
    where: {
      deletionRequested: true,
      scheduledDeletionDate: { lte: new Date() },
    },
    select: { id: true, email: true },
  })

  if (dueUsers.length === 0) {
    return NextResponse.json({ deletedCount: 0 })
  }

  const result = await prisma.user.deleteMany({
    where: { id: { in: dueUsers.map((u) => u.id) } },
  })

  return NextResponse.json({
    deletedCount: result.count,
    deletedUserIds: dueUsers.map((u) => u.id),
  })
}