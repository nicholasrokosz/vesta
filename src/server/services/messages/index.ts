/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {
  IMessageThread,
  MessageCreate,
  MessageThreadRead,
  MessageThreadArchived,
} from 'types/messages'
import { disableSending, isOverdue } from './threads'
import { mapReservationStatusToFriendlyName } from 'utils/reservationStatus'
import { ReservationStatus } from 'types/reservation'
import { sendPrompt } from 'server/integrations/openai/openai'
import type { ChatCompletionRequestMessage } from 'openai'
import type GuestService from '../guest'
import type { PrismaClient } from '@prisma/client'
import { Channel } from '@prisma/client'
import type BookingPalService from '../channels/bookingpal'
import { DateTime } from 'luxon'
import type NotificationService from '../notification'
import type { MessageThread } from './types'
import { GPTSystemPrompt } from './GPTSystemPrompt'

class MessageService {
  constructor(
    private readonly organizationId: string,
    private readonly prismaThread: PrismaClient['messageThread'],
    private readonly prismaMessage: PrismaClient['message'],
    private readonly prismaListing: PrismaClient['listing'],
    private readonly guestService: GuestService,
    private readonly bookingPalService: BookingPalService,
    private readonly notificationService: NotificationService
  ) {}

  private async mapThread(thread: MessageThread) {
    //console.log('thread', thread)
    const reservation = await this.guestService.getMostRecentReservation(
      thread.guest.id,
      thread.channel
    )

    if (thread.messages.length > 0) {
      const mostRecentMessage = thread.messages[thread.messages.length - 1]

      return {
        id: thread.id,
        guestName: thread.guest.name,
        guestEmail: thread.guest.email,
        guestPhone: thread.guest.phone,
        lastMessageSentAt: mostRecentMessage.timestamp,
        lastMessageText: mostRecentMessage.message,
        listing: {
          id: thread.listingId,
          name: thread.listing.name,
          timeZone: thread.listing.timeZone,
        },
        status: reservation
          ? mapReservationStatusToFriendlyName(
              reservation.status,
              new Date(reservation.calendarEvent.fromDate),
              new Date(reservation.calendarEvent.toDate)
            )
          : ReservationStatus.INQUIRY,
        messages: thread.messages.sort((a, b) => {
          return a.timestamp > b.timestamp ? 1 : -1
        }),
        calendarEventId: reservation?.calendarEvent.id,
        channel: thread.channel,
        unreadMessageCount: thread.messages.filter((m) => !m.read).length,
        isOverdue: isOverdue(thread.messages),
        disableSending: disableSending(thread),
        archived: thread.archived,
        enableReminder: thread.enableReminder,
      }
    } else {
      return {
        id: thread.id,
        guestName: thread.guest.name,
        guestEmail: thread.guest.email,
        guestPhone: thread.guest.phone,
        lastMessageSentAt: thread.createdAt,
        lastMessageText: '',
        listing: {
          id: thread.listingId,
          name: thread.listing.name,
          timeZone: thread.listing.timeZone,
        },
        status: reservation
          ? mapReservationStatusToFriendlyName(
              reservation.status,
              new Date(reservation.calendarEvent.fromDate),
              new Date(reservation.calendarEvent.toDate)
            )
          : ReservationStatus.INQUIRY,
        messages: [],
        calendarEventId: reservation?.calendarEvent.id,
        channel: thread.channel,
        unreadMessageCount: 0,
        isOverdue: false,
        disableSending: disableSending(thread),
        archived: thread.archived,
        enableReminder: thread.enableReminder,
      }
    }
  }

  async getAll(): Promise<IMessageThread[]> {
    const threads = await this.prismaThread.findMany({
      where: {
        listing: { organizationId: this.organizationId },
      },
      include: {
        listing: { include: { availability: true } },
        guest: true,
        messages: { orderBy: { timestamp: 'asc' } },
      },
    })

    const threadmodels = await Promise.all(
      threads.map((thread) => this.mapThread(thread))
    )

    threadmodels.sort((a, b) => {
      return b.lastMessageSentAt.getTime() - a.lastMessageSentAt.getTime()
    })

    return threadmodels
  }

  async getOne(id: string): Promise<IMessageThread> {
    const thread = await this.prismaThread.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        listing: { include: { availability: true } },
        guest: true,
        messages: true,
      },
    })

    return await this.mapThread(thread)
  }

  async getUnreadOverdue() {
    const messageThreads = await this.getAll()

    const unreadOverdue = messageThreads
      .filter((thread) => !thread.archived)
      .map(({ unreadMessageCount, isOverdue, enableReminder }) => ({
        unreadMessageCount,
        isOverdue,
        enableReminder,
      }))
      .reduce(
        (a, b) => {
          const obj = { ...a } as { unread: number; overdue: number }

          if (b.unreadMessageCount > 0) {
            obj.unread++
          }

          if (b.isOverdue && b.enableReminder) {
            obj.overdue++
          }

          return obj
        },
        { unread: 0, overdue: 0 }
      )

    return unreadOverdue
  }

  async updateMessageThreadReadStatus(thread: MessageThreadRead) {
    const updatedMessages = await this.prismaMessage.updateMany({
      where: {
        messageThreadId: thread.id,
        createdAt: {
          lt: new Date(),
        },
        read: !thread.read,
      },
      data: {
        read: thread.read,
      },
    })

    return updatedMessages
  }

  async updateMessageThreadArchivedStatus(thread: MessageThreadArchived) {
    const updatedThread = await this.prismaThread.update({
      where: {
        id: thread.id,
      },
      data: {
        archived: thread.archived,
      },
    })

    return updatedThread
  }

  async dismissMessageThreadReminder(messagedThreadId: string) {
    const updatedThread = await this.prismaThread.update({
      where: {
        id: messagedThreadId,
      },
      data: {
        enableReminder: false,
      },
    })

    return updatedThread
  }

  async getGPTChatResponse(
    listingId: string,
    prompts: ChatCompletionRequestMessage[],
    messageThread: IMessageThread
  ) {
    const listing = await this.prismaListing.findFirst({
      where: {
        id: listingId,
      },
      include: {
        amenities: true,
        rules: true,
        availability: true,
        content: true,
      },
    })

    let systemPrompt = ''
    try {
      if (!listing) {
        console.error('No listing found for id', listingId)
      } else {
        const promptBuilder = new GPTSystemPrompt({
          listing: {
            name: listing?.name || '',
            line1: listing?.line1 || '',
            line2: listing?.line2 || '',
            city: listing?.city || '',
            state: listing?.state || '',
            zip: listing?.zip || '',
            country: listing?.country || '',
            wifiName: listing?.wifiName || null,
            wifiPassword: listing?.wifiPassword || null,
            doorCode: listing?.doorCode || null,
          },
          content: listing?.content,
          rules: listing?.rules,
          availability: listing?.availability,
          amenities: listing?.amenities,
        })

        systemPrompt = promptBuilder.buildPromptForListing()
      }

      const threadString = messageThread.messages
        .map(
          ({ message, user }) =>
            `${user === 'GUEST' ? 'Guest' : 'Property manager'}: ${message}`
        )
        .join('\n')

      const result = await sendPrompt(
        prompts,
        threadString,
        systemPrompt || null
      )
      return result
    } catch (e) {
      console.error('Error in getGPTChatResponse', e)
      return 'An error occurred while processing your request. Please try again later or contact support if the issue persists.'
    }
  }

  async resetThreadSettings(messageThreadId: string) {
    await this.prismaThread.update({
      where: { id: messageThreadId },
      data: {
        archived: false,
        enableReminder: true,
      },
    })
  }

  async createMessage(message: MessageCreate) {
    const messageThread = await this.prismaThread.findUniqueOrThrow({
      where: { id: message.messageThreadId },
    })

    await this.resetThreadSettings(message.messageThreadId)

    const newMessage = await this.prismaMessage.create({
      data: {
        ...message,
        timestamp: new Date(),
        read: message.user === 'PROPERTY_MANAGER',
      },
    })

    // PM to Guest
    if (message.user === 'PROPERTY_MANAGER') {
      // Airbnb
      if (messageThread.bpThreadId) {
        const listing = await this.prismaListing.findUnique({
          where: { id: messageThread.listingId },
        })

        await this.bookingPalService.sendMessage(
          messageThread.bpThreadId,
          message.message,
          listing?.propertyOwnerId || null
        )
      } else if (messageThread.channel === Channel.VRBO) {
        await this.notificationService.sendVrboGuestNotification(newMessage.id)
      } else if (messageThread.channel === Channel.Direct) {
        await this.notificationService.sendDirectGuestNotification(
          newMessage.id
        )
      }
    }

    // Guest to PM
    else if (message.user === 'GUEST') {
      await this.notificationService.sendNewMessageNotification(newMessage.id)
    }

    return newMessage
  }

  async getMessageThread(messageThreadId: string) {
    return await this.prismaThread.findFirstOrThrow({
      where: {
        listing: { organizationId: this.organizationId },
        id: messageThreadId,
      },
    })
  }

  async getMessageThreadByReplyTo(replyTo: string) {
    return await this.prismaThread.findUnique({
      where: {
        replyTo,
      },
    })
  }

  async getThreadbyListing(
    listingId: string,
    guestId: string,
    channel: Channel
  ) {
    return await this.prismaThread.findUnique({
      where: {
        guestId_listingId_channel: {
          guestId,
          listingId,
          channel,
        },
      },
    })
  }

  async createDirectMessageThread(
    listingId: string,
    guestId: string,
    fromDate: Date,
    toDate: Date
  ) {
    const thread = await this.getThreadbyListing(listingId, guestId, 'Direct')
    if (thread) return thread

    return await this.createMessageThread(
      listingId,
      guestId,
      fromDate,
      toDate,
      Channel.Direct
    )
  }

  async getOrCreateVrboMessageThread(
    listingId: string,
    guestId: string,
    fromDate: Date,
    toDate: Date,
    replyTo: string
  ) {
    const thread = await this.getThreadbyListing(listingId, guestId, 'VRBO')
    if (thread) return thread.id

    const messagedThread = await this.createMessageThread(
      listingId,
      guestId,
      fromDate,
      toDate,
      Channel.VRBO,
      replyTo
    )
    if (!messagedThread) throw new Error('Could not create message thread')

    return messagedThread.id
  }

  private async createMessageThread(
    listingId: string,
    guestId: string,
    fromDate: Date,
    toDate: Date,
    channel: Channel,
    replyTo?: string
  ) {
    try {
      return await this.prismaThread.create({
        data: {
          listingId,
          guestId,
          channel,
          dateFrom: DateTime.fromJSDate(fromDate).toISODate(),
          dateTo: DateTime.fromJSDate(toDate).toISODate(),
          replyTo,
        },
      })
    } catch (e) {
      console.log(
        `Message thread already exists for guest ${guestId} and listing ${listingId}`
      )
    }
  }

  async setReplyTo(messageThreadId: string, replyTo: string) {
    await this.prismaThread.update({
      where: { id: messageThreadId },
      data: {
        replyTo,
      },
    })
  }
}

export default MessageService
