import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { EntryDetail } from './entry-detail'

export async function generateMetadata({ params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return {}
  const diary = await prisma.diary.findUnique({ where: { id } })
  return { title: diary ? `${diary.title} — MyDiary` : 'Entry — MyDiary' }
}

export default async function EntryPage({ params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) notFound()

  const diary = await prisma.diary.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      user: { select: { id: true, name: true, avatar: true } },
    },
  })

  const isOwner = diary?.userId === session.user.id
  const isViewablePublic = diary?.privacy === 'public' && !diary.isArchived

  if (!diary || (!isOwner && !isViewablePublic)) notFound()

  return <EntryDetail diary={JSON.parse(JSON.stringify(diary))} isOwner={isOwner} />
}