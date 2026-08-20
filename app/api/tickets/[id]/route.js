import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized', reason: 'no_session' }, { status: 401 })
  }

  const { id } = await params

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      attachments: true,
      replies: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!ticket) {
    return NextResponse.json({ error: 'Not found', reason: 'ticket_missing', id }, { status: 404 })
  }

  if (ticket.userId !== session.user.id) {
    return NextResponse.json(
      {
        error: 'Not found',
        reason: 'owner_mismatch',
        ticketUserId: ticket.userId,
        sessionUserId: session.user.id,
      },
      { status: 404 }
    )
  }

  return NextResponse.json({ ticket })
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const message = (body?.message || '').trim()

  if (!message) {
    return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
  }

  const ticket = await prisma.supportTicket.findUnique({ where: { id } })
  if (!ticket || ticket.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const reply = await prisma.ticketReply.create({
    data: {
      ticketId: id,
      authorId: session.user.id,
      isAdmin: false,
      message,
    },
  })

  // Notify all admins that the user replied
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true },
  })

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: 'TICKET_REPLY',
        title: 'New reply on a support ticket',
        body: `${ticket.ticketNumber}: new message from the user.`,
        link: `/admin/tickets/${ticket.id}`,
      })),
    })
  }

  return NextResponse.json({ reply }, { status: 201 })
}