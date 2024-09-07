import type { Channel, PrismaClient } from '@prisma/client'
import type { GuestCreate } from './types'
import {
  getQuery,
  cleanPhone,
  cleanEmail,
  cleanName,
  getNextReservation,
} from './utils'

class GuestService {
  constructor(
    private readonly prisma: PrismaClient['guest'],
    private readonly organizationId: string
  ) {}

  async getById(id: string) {
    const guest = await this.prisma.findUniqueOrThrow({
      where: { id },
      include: { messageThreads: true },
    })

    return guest
  }

  async getOrCreate({ name, email, phone }: GuestCreate): Promise<string> {
    const cleanedName = cleanName(name)
    const cleanedEmail = cleanEmail(email)
    const cleanedPhone = cleanPhone(phone)

    if (cleanedEmail || cleanedPhone) {
      const query = getQuery(this.organizationId, {
        name: cleanedName,
        email: cleanedEmail,
        phone: cleanedPhone,
      })

      const guest = await this.prisma.findFirst({
        where: query,
      })
      if (guest) return guest.id
    }

    const newGuest = await this.prisma.create({
      data: {
        name: cleanedName,
        email: cleanedEmail,
        phone: cleanedPhone,
        organizationId: this.organizationId,
      },
    })

    return newGuest.id
  }

  async updateEmail(guestId: string, email: string) {
    const cleanedEmail = cleanEmail(email)

    if (cleanedEmail) {
      await this.prisma.update({
        where: { id: guestId },
        data: {
          email: cleanedEmail,
        },
      })
    }
  }

  async getMostRecentReservation(guestId: string, channel: Channel) {
    const guest = await this.prisma.findFirstOrThrow({
      where: {
        id: guestId,
      },
      include: {
        reservations: {
          where: {
            channel,
          },
          orderBy: {
            calendarEvent: {
              toDate: 'desc',
            },
          },
          include: { calendarEvent: true },
        },
      },
    })

    if (guest.reservations.length === 0) return null
    return getNextReservation(guest.reservations)
  }
}

export default GuestService
