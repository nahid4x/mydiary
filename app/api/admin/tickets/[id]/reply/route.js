import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function POST(req, { params }) {
  const { session, error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await req.json()
  const message = (body?.message || '').trim()

  if (!message) {
    return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
  }

  const ticket = await prisma.supportTicket.findUnique({ where: { id } })
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const reply = await prisma.ticketReply.create({
    data: {
      ticketId: id,
      authorId: session.user.id,
      isAdmin: true,
      message,
    },
  })

  // If ticket was OPEN, move it to IN_REVIEW automatically
  if (ticket.status === 'OPEN') {
    await prisma.supportTicket.update({
      where: { id },
      data: { status: 'IN_REVIEW' },
    })
  }

  // Notify the ticket owner
  await prisma.notification.create({
    data: {
      userId: ticket.userId,
      type: 'TICKET_REPLY',
      title: 'Your report has been updated',
      body: `An admin has replied to your support report ${ticket.ticketNumber}.`,
      link: `/settings/reports/${ticket.id}`,
    },
  })

  return NextResponse.json({ reply }, { status: 201 })
}