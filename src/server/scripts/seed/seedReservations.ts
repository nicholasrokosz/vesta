import { prisma } from 'server/db'
import fs from 'fs'
import DateString from 'types/dateString'
import type { Channel } from '@prisma/client'

export default async function seedReservations(organizationId: string) {
  console.log(`Seeding reservations with dummy data...`)
  const csvData = getData()
  const reservations = processCsv(csvData)
  //console.log(reservations)

  await Promise.all(
    reservations.map(async (reservation) => {
      if (!reservation.listingId) return Promise.resolve()
      const calendarEvent = await prisma.calendarEvent.create({
        data: {
          listingId: reservation.listingId,
          fromDate: DateString.fromString(reservation.dateFrom).toDate(),
          toDate: DateString.fromString(reservation.dateTo).toDate(),
          bookedOn: DateString.fromString(reservation.bookedOn).toDate(),
          type: 'Reservation',
          reservation: {
            create: {
              channel: reservation.channel as Channel,
              adults: 1,
              children: 0,
              guest: {
                create: {
                  organizationId,
                  name: reservation.guestName,
                },
              },
              revenue: {
                create: {
                  channelCommission: parseFloat(reservation.commission),
                  pmcShare: 0,
                },
              },
            },
          },
        },
        include: {
          reservation: { include: { revenue: true } },
        },
      })

      await prisma.revenueFee.create({
        data: {
          revenueId: calendarEvent.reservation?.revenue?.id || '',
          name: 'Accomodation revenue',
          value: parseFloat(reservation.accommodation),
          unit: 'PerStay',
          pmcShare: 0,
          type: 'ACCOMMODATION',
          deductions: {
            create: {
              description: 'Tax',
              value: parseFloat(reservation.taxes),
              type: 'TAX',
            },
          },
        },
      })

      await prisma.revenueFee.create({
        data: {
          revenueId: calendarEvent.reservation?.revenue?.id || '',
          name: 'Cleaning Fee',
          value: parseFloat(reservation.fees),
          unit: 'PerStay',
          pmcShare: 0,
          type: 'GUEST_FEE',
        },
      })
    })
  )
}

const getData = () => {
  return fs.readFileSync('./src/server/scripts/seed/reservations.csv', 'utf8')
}

const processCsv = (text: string) => {
  const lines = text.split('\n').slice(1, -1)

  return lines.map((line) => {
    const [
      channel,
      listingId,
      guestName,
      bookedOn,
      dateFrom,
      dateTo,
      accommodation,
      fees,
      commission,
      taxes,
    ] = line.split(',')

    return {
      channel,
      listingId,
      guestName,
      bookedOn,
      dateFrom,
      dateTo,
      accommodation,
      fees,
      commission,
      taxes,
    }
  })
}
