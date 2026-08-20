import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { diarySchema } from '@/lib/validations'

async function getDiaryForUser(id, userId) {
  const diary = await prisma.diary.findUnique({ where: { id }, include: { tags: { include: { tag: true } } } })
  if (!diary || diary.userId !== userId) return null
  return diary
}

export async function GET(req, { params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const diary = await prisma.diary.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      user: { select: { id: true, name: true, avatar: true } },
    },
  })

  if (!diary) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isOwner = diary.userId === session.user.id
  const isViewablePublic = diary.privacy === 'public' && !diary.isArchived

  if (!isOwner && !isViewablePublic) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ diary })
}

export async function PUT(req, { params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await getDiaryForUser(id, session.user.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const body = await req.json()
    const bodyKeys = Object.keys(body)

    // Only treat this as a lightweight toggle when the body contains
    // ONLY isFavorite/isArchived and nothing else (e.g. list/detail quick actions).
    // Full edit submissions include title/content/etc alongside isFavorite/isArchived,
    // so they must NOT take this shortcut.
    const isToggleOnly =
      bodyKeys.length > 0 &&
      bodyKeys.every((k) => k === 'isFavorite' || k === 'isArchived')

    if (isToggleOnly) {
      const updated = await prisma.diary.update({
        where: { id },
        data: {
          ...(body.isFavorite !== undefined && { isFavorite: body.isFavorite }),
          ...(body.isArchived !== undefined && { isArchived: body.isArchived }),
        },
        include: { tags: { include: { tag: true } } },
      })
      return NextResponse.json({ diary: updated })
    }

    const parsed = diarySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { title, content, mood, weather, privacy, tags, entryDate } = parsed.data
    const image = body.image

    const tagNames = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : []

    await prisma.diaryTag.deleteMany({ where: { diaryId: id } })

    const updated = await prisma.diary.update({
      where: { id },
      data: {
        title,
        content,
        mood: mood || null,
        weather: weather || null,
        privacy: privacy || 'private',
        image: image !== undefined ? image : existing.image,
        entryDate: entryDate ? new Date(entryDate) : existing.entryDate,
        // Full edit form also sends these — persist them instead of dropping them
        ...(body.isFavorite !== undefined && { isFavorite: body.isFavorite }),
        ...(body.isArchived !== undefined && { isArchived: body.isArchived }),
        tags: {
          create: await Promise.all(
            tagNames.map(async (name) => {
              const tag = await prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
              return { tagId: tag.id }
            })
          ),
        },
      },
      include: { tags: { include: { tag: true } } },
    })

    return NextResponse.json({ diary: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await getDiaryForUser(id, session.user.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.diary.delete({ where: { id } })
  return NextResponse.json({ message: 'Entry deleted' })
}