import type { PrismaClient } from '@prisma/client'

class ReservationService {
  constructor(
    private readonly prisma: PrismaClient['reservation'],
    private readonly organizationId: string
  ) {}

  async get(id: string) {
    return await this.prisma.findUnique({
      where: {
        id,
      },
      include: {
        calendarEvent: true,
        revenue: { include: { fees: { include: { deductions: true } } } },
      },
    })
  }

  async getByBpReservationId(bpReservationId: string) {
    return await this.prisma.findUnique({
      where: {
        bpReservationId,
      },
      include: { calendarEvent: true, guest: true },
    })
  }

  async getByConfirmationCode(confirmationCode: string) {
    return await this.prisma.findUnique({
      where: {
        confirmationCode,
      },
      include: { calendarEvent: true, guest: true },
    })
  }

  async getAllByListing(listingId: string) {
    return await this.prisma.findMany({
      where: {
        calendarEvent: {
          listingId,
        },
      },
      include: {
        calendarEvent: true,
        guest: true,
        revenue: {
          include: {
            fees: { include: { deductions: true } },
            reservation: { select: { channel: true } },
          },
        },
      },
    })
  }
}

export default ReservationService
