import { prisma } from './prisma'

export async function generateTicketNumber() {
  const year = new Date().getFullYear()
  const prefix = `MD-${year}-`

  const last = await prisma.supportTicket.findFirst({
    where: { ticketNumber: { startsWith: prefix } },
    orderBy: { ticketNumber: 'desc' },
    select: { ticketNumber: true },
  })

  let next = 1
  if (last?.ticketNumber) {
    const lastSeq = parseInt(last.ticketNumber.split('-').pop(), 10)
    if (!Number.isNaN(lastSeq)) next = lastSeq + 1
  }

  return `${prefix}${String(next).padStart(6, '0')}`
}