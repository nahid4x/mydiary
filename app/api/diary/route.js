import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { diarySchema } from '@/lib/validations'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const mood = searchParams.get('mood') || ''
  const tag = searchParams.get('tag') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const favorite = searchParams.get('favorite') === 'true'
  const archived = searchParams.get('archived') === 'true'

  const where = {
    userId: session.user.id,        // ← THE FIX: scope to logged-in user
    isArchived: archived,           // ← false by default, true for archive page
    ...(favorite && { isFavorite: true }),  // ← filter favorites
    ...(mood && { mood }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(tag && {
      tags: { some: { tag: { name: { equals: tag, mode: 'insensitive' } } } },
    }),
  }

  const orderBy =
    sort === 'oldest' ? { entryDate: 'asc' } : sort === 'title' ? { title: 'asc' } : { entryDate: 'desc' }

  const [diaries, total] = await Promise.all([
    prisma.diary.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        tags: { include: { tag: true } },
        user: { select: { id: true, name: true, avatar: true } },
      },
    }),
    prisma.diary.count({ where }),
  ])

  return NextResponse.json({ diaries, total, pages: Math.ceil(total / limit) })
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = diarySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { title, content, mood, weather, privacy, tags, entryDate } = parsed.data
    const image = body.image

    const tagNames = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : []

    const diary = await prisma.diary.create({
      data: {
        title,
        content,
        mood: mood || null,
        weather: weather || null,
        privacy: privacy || 'private',
        image: image || null,
        entryDate: entryDate ? new Date(entryDate) : new Date(),
        isFavorite: body.isFavorite || false,
        userId: session.user.id,
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

    return NextResponse.json({ diary }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }
}