import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { EditEntryClient } from './edit-entry-client'

export const metadata = { title: 'Edit Entry — MyDiary' }

export default async function EditEntryPage({ params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) notFound()

  const diary = await prisma.diary.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  })

  if (!diary || diary.userId !== session.user.id) notFound()

  return <EditEntryClient diary={JSON.parse(JSON.stringify(diary))} />
}