import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { reportTicketSchema } from '@/lib/validations'
import { generateTicketNumber } from '@/lib/ticket-utils'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      ticketNumber: true,
      category: true,
      priority: true,
      status: true,
      subject: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ tickets })
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = reportTicketSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const {
    browser = null,
    os = null,
    screenResolution = null,
    appVersion = null,
    language = null,
    timezone = null,
    attachments = [],
  } = body

  const MAX_ATTEMPTS = 3
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const ticketNumber = await generateTicketNumber()
      const ticket = await prisma.supportTicket.create({
        data: {
          ticketNumber,
          userId: session.user.id,
          category: parsed.data.category,
          priority: parsed.data.priority,
          subject: parsed.data.subject,
          description: parsed.data.description,
          stepsToReproduce: parsed.data.stepsToReproduce || null,
          contactPermission: parsed.data.contactPermission,
          browser,
          os,
          screenResolution,
          appVersion,
          language,
          timezone,
          attachments: {
            create: attachments
              .filter((a) => a?.url)
              .map((a) => ({
                url: a.url,
                filename: a.filename || 'attachment',
                mimeType: a.mimeType || 'application/octet-stream',
                size: a.size || 0,
              })),
          },
          replies: {
            create: { authorId: session.user.id, isAdmin: false, message: parsed.data.description },
          },
        },
        include: { attachments: true },
      })

      // Notify all admins of the new ticket
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      })

      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: 'NEW_TICKET',
            title: 'New support ticket',
            body: `${ticket.ticketNumber}: ${ticket.subject}`,
            link: `/admin/tickets/${ticket.id}`,
          })),
        })
      }

      return NextResponse.json({ ticket }, { status: 201 })
    } catch (err) {
      const isCollision = err.code === 'P2002' && err.meta?.target?.includes('ticketNumber')
      if (isCollision && attempt < MAX_ATTEMPTS) continue
      console.error(err)
      return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
    }
  }
}