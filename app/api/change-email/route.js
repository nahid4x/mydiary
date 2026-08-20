import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { changeEmailSchema } from '@/lib/validations'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = changeEmailSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || 'Invalid input' },
      { status: 400 }
    )
  }

  const { newEmail, currentPassword } = parsed.data

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const passwordValid = await bcrypt.compare(currentPassword, user.password)
  if (!passwordValid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 400 })
  }

  if (newEmail.toLowerCase() === user.email.toLowerCase()) {
    return NextResponse.json({ error: 'This is already your email' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: newEmail } })
  if (existing) {
    return NextResponse.json({ error: 'Email is already in use' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { email: newEmail },
  })

  return NextResponse.json({ success: true })
}