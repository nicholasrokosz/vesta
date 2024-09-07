import type { PrismaClient } from '@prisma/client'
import { Channel } from '@prisma/client'
import { DateTime } from 'luxon'

export const backFillReservationThreads = async (
  prisma: PrismaClient
): Promise<void> => {
  const reservations = await prisma.calendarEvent.findMany({
    where: {
      NOT: {
        reservation: null,
      },
      reservation: {
        channel: Channel.Direct,
      },
    },
    include: {
      listing: true,
      reservation: { include: { guest: true } },
    },
  })

  console.log(`Found ${reservations.length} reservations`)

  for (const r of reservations) {
    if (r.reservation && r.reservation.guest.email) {
      const existingMessageThread = await prisma.messageThread.findFirst({
        where: {
          listingId: r.listingId,
          guestId: r.reservation.guestId,
          channel: Channel.Direct,
        },
      })

      if (!existingMessageThread) {
        console.log(
          `Creating message thread for reservation ${r.reservation.id}`
        )

        await prisma.messageThread.create({
          data: {
            listingId: r.listingId,
            guestId: r.reservation.guestId,
            channel: Channel.Direct,
            dateFrom: DateTime.fromJSDate(r.fromDate).toISODate(),
            dateTo: DateTime.fromJSDate(r.toDate).toISODate(),
          },
        })
      }
    }
  }
}
