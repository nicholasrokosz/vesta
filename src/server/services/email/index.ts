import type { PostmarkInboundMessage } from 'server/integrations/postmark/types'
import ListingService from '../listing'
import {
  parseMailboxHash,
  parsePropertyId,
  parseReservationId,
  parseDates,
  parseInquiryMessage,
  parseReservationMessage,
} from './parser'
import type MessageService from '../messages'
import type NotificationService from '../notification'
import type GuestService from '../guest'
import type ReservationService from '../reservation'

class EmailService {
  private readonly listingService: ListingService

  constructor(
    private readonly organizationId: string,
    private readonly messageService: MessageService,
    private readonly notificationService: NotificationService,
    private readonly guestService: GuestService,
    private readonly reservationService: ReservationService
  ) {
    this.listingService = new ListingService()
  }

  async processInbound(message: PostmarkInboundMessage) {
    if (message.OriginalRecipient.startsWith('vesta+'))
      await this.handleDirect(message)
    else if (message.OriginalRecipient.startsWith('vrbo+'))
      await this.handleVrbo(message)
  }

  private async handleDirect(data: PostmarkInboundMessage) {
    console.log('Processing Direct message...')

    const { messageThreadId } = parseMailboxHash(data.MailboxHash)
    if (!messageThreadId) {
      throw new Error('Could not parse message thread id from mailbox hash')
    }

    try {
      await this.messageService.getMessageThread(messageThreadId)

      try {
        await this.messageService.createMessage({
          message: data.StrippedTextReply
            ? data.StrippedTextReply
            : data.TextBody,
          messageThreadId: messageThreadId,
          user: 'GUEST',
        })
      } catch (e) {
        console.error('could not create message', e)
        return
      }
    } catch (e) {
      console.error('could not locate message thread with id', messageThreadId)
    }
  }

  async handleVrbo(data: PostmarkInboundMessage) {
    console.log('Processing Vrbo message...')

    try {
      const bpReservationId = parseReservationId(data.TextBody)

      if (bpReservationId) {
        await this.handleVrboReservation(
          data.TextBody,
          data.ReplyTo,
          bpReservationId
        )
      } else {
        await this.handleVrboInquiry(data.TextBody, data.ReplyTo, data.FromName)
      }
    } catch (e) {
      console.error('Eror processing inbound Postmark message: ', e)
    }
  }

  private async handleVrboReservation(
    body: string,
    replyTo: string,
    bpReservationId: string
  ) {
    const message = parseReservationMessage(body)
    if (!message) {
      throw new Error('Could not parse reservation')
    }

    let messageThread = await this.messageService.getMessageThreadByReplyTo(
      replyTo
    )

    if (messageThread) {
      return await this.messageService.createMessage({
        user: 'GUEST',
        message,
        messageThreadId: messageThread.id,
      })
    }

    const reservation = await this.reservationService.getByBpReservationId(
      bpReservationId
    )
    if (!reservation) {
      // This should never happen, since all Vrbo reservations get mapped.
      console.log(`Could not find reservation for id ${bpReservationId}`)
      return
    }

    messageThread = await this.messageService.getThreadbyListing(
      reservation.calendarEvent.listingId,
      reservation.guestId,
      'VRBO'
    )

    let messageThreadId = messageThread?.id
    if (messageThread) {
      if (!messageThread?.replyTo) {
        await this.messageService.setReplyTo(messageThread.id, replyTo)
      }
    } else {
      messageThreadId = await this.messageService.getOrCreateVrboMessageThread(
        reservation.calendarEvent.listingId,
        reservation.guestId,
        reservation.calendarEvent.fromDate,
        reservation.calendarEvent.toDate,
        replyTo
      )
    }

    await this.messageService.createMessage({
      user: 'GUEST',
      message,
      messageThreadId: messageThreadId as string,
    })
  }

  private async handleVrboInquiry(
    body: string,
    replyTo: string,
    guestName: string
  ) {
    const message = parseInquiryMessage(body)
    if (!message) {
      throw new Error('Could not parse inquiry')
    }

    const messageThread = await this.messageService.getMessageThreadByReplyTo(
      replyTo
    )

    if (messageThread) {
      return await this.messageService.createMessage({
        user: 'GUEST',
        message,
        messageThreadId: messageThread.id,
      })
    }

    const productId = parsePropertyId(body)
    const dates = parseDates(body)
    if (!productId || !dates || !!!message) {
      throw new Error('Could not parse inquiry')
    }

    const listing = await this.listingService.getByBpProductId(productId)
    if (!listing)
      throw new Error(
        `Error processing Vrbo inquiry: Could not find listing for id ${productId}`
      )

    const guestId = await this.guestService.getOrCreate({
      name: guestName,
    })

    const messageThreadId =
      await this.messageService.getOrCreateVrboMessageThread(
        listing.id,
        guestId,
        dates[0],
        dates[1],
        replyTo
      )

    await this.messageService.createMessage({
      user: 'GUEST',
      message,
      messageThreadId,
    })
  }
}

export default EmailService
