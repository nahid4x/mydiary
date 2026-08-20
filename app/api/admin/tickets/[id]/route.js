import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      attachments: true,
      replies: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ ticket })
}

const STATUS_LABELS = {
  OPEN: 'Open',
  IN_REVIEW: 'In Review',
  NEED_MORE_INFO: 'Needs More Info',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
}

export async function PATCH(req, { params }) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await req.json()
  const { status } = body

  const validStatuses = ['OPEN', 'IN_REVIEW', 'NEED_MORE_INFO', 'RESOLVED', 'CLOSED']
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const existing = await prisma.supportTicket.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(status === 'CLOSED' && { closedAt: new Date() }),
    },
  })

  if (status && status !== existing.status) {
    await prisma.notification.create({
      data: {
        userId: ticket.userId,
        type: 'TICKET_REPLY',
        title: 'Your report status changed',
        body: `${ticket.ticketNumber} is now marked as ${STATUS_LABELS[status] || status}.`,
        link: `/settings/reports/${ticket.id}`,
      },
    })
  }

  return NextResponse.json({ ticket })
}