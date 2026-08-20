import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { reason, feedback, password } = body

  if (!reason) {
    return NextResponse.json({ error: 'Please select a reason' }, { status: 400 })
  }
  if (!password) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const scheduledDeletionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      deletionRequested: true,
      deletionRequestedAt: new Date(),
      scheduledDeletionDate,
      deleteReason: reason,
      deleteFeedback: feedback || null,
    },
  })

  await prisma.notification.create({
    data: {
      userId: session.user.id,
      type: 'DELETION_REQUESTED',
      title: 'Account deletion scheduled',
      body: `Your account will be deleted on ${scheduledDeletionDate.toLocaleDateString()} unless you cancel.`,
      link: '/settings',
    },
  })

  return NextResponse.json({ scheduledDeletionDate })
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.deletionRequested) {
    return NextResponse.json({ error: 'No deletion request found' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      deletionRequested: false,
      deletionRequestedAt: null,
      scheduledDeletionDate: null,
      deleteReason: null,
      deleteFeedback: null,
    },
  })

  await prisma.notification.create({
    data: {
      userId: session.user.id,
      type: 'DELETION_CANCELLED',
      title: 'Account deletion cancelled',
      body: 'Your account is safe. The scheduled deletion has been cancelled.',
      link: '/settings',
    },
  })

  return NextResponse.json({ success: true })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { deletionRequested: true, scheduledDeletionDate: true },
  })

  if (!user?.deletionRequested) {
    return NextResponse.json({ scheduledDeletionDate: null })
  }

  return NextResponse.json({ scheduledDeletionDate: user.scheduledDeletionDate })
}