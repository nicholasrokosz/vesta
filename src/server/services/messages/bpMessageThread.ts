import type { PrismaClient } from '@prisma/client'
import { DateTime } from 'luxon'
import type ChannelService from '../channels/bookingpal'
import type GuestService from '../guest'
import ListingService from '../listing'
import type NotificationService from '../notification'
import type ReservationService from '../reservation'
import type { BpMessage, BpMessageThread } from './types'

class BpMessageThreadService {
  private readonly listingService: ListingService

  constructor(
    private readonly prismaThread: PrismaClient['messageThread'],
    private readonly prismaMessage: PrismaClient['message'],
    private readonly organizationId: string,
    private readonly guestService: GuestService,
    private readonly channelService: ChannelService,
    private readonly reservationService: ReservationService,
    private readonly notificationService: NotificationService
  ) {
    this.listingService = new ListingService()
  }

  private async handleThread(
    {
      productId,
      bpThreadId,
      channelThreadId,
      channel,
      lastMessageSentAt,
      dateFrom,
      dateTo,
      guestName,
      bpReservationId,
    }: BpMessageThread,
    getMessages = true
  ) {
    const thread = await this.prismaThread.findUnique({
      where: {
        bpThreadId: bpThreadId.toString(),
      },
      include: { guest: true },
    })

    let threadId = thread?.id
    const listing = await this.listingService.getByBpProductId(productId)

    if (thread) {
      if (bpReservationId && !thread.guest.phone) {
        // This scenario is when an inquiry thread now has a reservation
        // TODO: Update the thread to point at the new guest and delete the old
        // Also update the dates
      }

      if (thread.lastMessageSentAt === lastMessageSentAt) return
      const reservation = await this.guestService.getMostRecentReservation(
        thread.guestId,
        thread.channel
      )
      const dates: [dateFrom: string, dateTo: string] = [
        reservation
          ? DateTime.fromJSDate(reservation.calendarEvent.fromDate).toISODate()
          : dateFrom,
        reservation
          ? DateTime.fromJSDate(reservation.calendarEvent.toDate).toISODate()
          : dateTo,
      ]

      await this.prismaThread.update({
        where: { id: thread.id },
        data: {
          lastMessageSentAt,
          dateFrom: dates[0],
          dateTo: dates[1],
        },
      })
    } else {
      if (!listing) {
        // What do we do if the listing doesn't exist? This shouldn't happen
        console.log(
          `handleThread: Listing not found for bpProductId ${productId}`
        )
        return
      }

      if (bpReservationId) {
        // If we find a reservation, use it to create a new thread.
        // If we don't find a reservation, it could be:
        //   1. The reservation came in as a Request To Book (we don't process those, treat it like an inquiry)
        //   2. The reservation predates the integration (we don't have a reservation for it, treat it like an inquiry)
        const reservation = await this.reservationService.getByBpReservationId(
          bpReservationId
        )

        if (reservation) {
          const thread = await this.prismaThread.create({
            data: {
              listingId: listing.id,
              guestId: reservation.guestId,
              channel,
              bpThreadId,
              channelThreadId,
              lastMessageSentAt,
              dateFrom: DateTime.fromJSDate(
                reservation.calendarEvent.fromDate
              ).toISODate(),
              dateTo: DateTime.fromJSDate(
                reservation.calendarEvent.toDate
              ).toISODate(),
            },
          })
          threadId = thread.id
        } else {
          console.log(
            `handleThread: Reservation not found for bpReservationId ${bpReservationId}`
          )

          // It's an inquiry so we need to create a guest
          const guestId = await this.guestService.getOrCreate({
            name: guestName,
          })
          const thread = await this.prismaThread.create({
            data: {
              listingId: listing.id,
              guestId,
              channel,
              bpThreadId,
              channelThreadId,
              lastMessageSentAt,
              dateFrom,
              dateTo,
            },
          })
          threadId = thread.id
        }
      } else {
        // It's an inquiry so we need to create a guest
        const guestId = await this.guestService.getOrCreate({
          name: guestName,
        })
        const thread = await this.prismaThread.create({
          data: {
            listingId: listing.id,
            guestId,
            channel,
            bpThreadId,
            channelThreadId,
            lastMessageSentAt,
            dateFrom,
            dateTo,
          },
        })
        threadId = thread.id
      }
    }
    if (!threadId) return // This can never happen

    // Get messages
    if (!getMessages) return

    const messages = await this.channelService.getMessages(
      bpThreadId,
      listing?.propertyOwnerId || null
    )

    for (const bpMessage of messages) {
      // Assumes the messages are in order; we stop once we find one that already exists
      const message = await this.prismaMessage.findUnique({
        where: { bpMessageId: bpMessage.bpMessageId },
      })

      if (message) break

      await this.handleMessage({
        message: bpMessage.message,
        user: bpMessage.user,
        messageThreadId: threadId,
        timestamp: bpMessage.timestamp,
        bpMessageId: bpMessage.bpMessageId,
        channelMessageId: bpMessage.channelMessageId,
      })
    }
  }

  private async handleMessage(bpMessage: BpMessage) {
    const message = await this.prismaMessage.findUnique({
      where: { bpMessageId: bpMessage.bpMessageId },
    })

    if (message) return

    // Check to see if the message exists in the database
    const messagetoUpdate = await this.prismaMessage.findFirst({
      where: {
        messageThreadId: bpMessage.messageThreadId,
        user: 'PROPERTY_MANAGER',
        message: bpMessage.message,
        bpMessageId: null,
      },
    })
    if (messagetoUpdate) {
      await this.prismaMessage.update({
        where: { id: messagetoUpdate.id },
        data: {
          bpMessageId: bpMessage.bpMessageId,
          channelMessageId: bpMessage.channelMessageId,
          timestamp: bpMessage.timestamp,
        },
      })
      return
    }

    // TODO: Update this to use the Message Service and use it to create the message
    // Creating the message in the service will automatically unarchive the thread
    // if it's currently archived
    await this.prismaThread.update({
      where: { id: bpMessage.messageThreadId },
      data: {
        archived: false,
      },
    })

    const newMessage = await this.prismaMessage.create({
      data: {
        message: bpMessage.message,
        messageThreadId: bpMessage.messageThreadId,
        user: bpMessage.user,
        timestamp: bpMessage.timestamp,
        read: bpMessage.user === 'PROPERTY_MANAGER',
        bpMessageId: bpMessage.bpMessageId,
        channelMessageId: bpMessage.channelMessageId,
      },
    })

    if (bpMessage.user === 'GUEST') {
      await this.notificationService.sendNewMessageNotification(newMessage.id)
    }
  }

  async processThreads() {
    const channelThreads = await this.channelService.getThreads()

    for (const channelThread of channelThreads) {
      await this.handleThread(channelThread)
    }
  }

  async processThread(thread: BpMessageThread) {
    await this.handleThread(thread, false)
  }

  async processMessage(message: BpMessage) {
    message.timestamp = DateTime.fromJSDate(message.timestamp).toJSDate()

    await this.handleMessage(message)
  }
}

export default BpMessageThreadService
