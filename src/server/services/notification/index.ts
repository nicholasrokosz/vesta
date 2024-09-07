import PMNotification from 'components/emailTemplate/PMNotification'
import GuestNotification from 'components/emailTemplate/GuestNotification'
import DirectBookingNotification from 'components/emailTemplate/DirectBookingNotification'
import { render } from '@react-email/render'
import type PostmarkService from 'server/integrations/postmark'
import ListingService from '../listing'
import { DateTime } from 'luxon'
import type { MessageThread, Prisma } from '@prisma/client'
import DirectBookingGuestConfirmation from 'components/emailTemplate/DirectBookingGuestConfirmation'
import { RevenueSummaryBuilder } from '../revenue/revenueSummary'
import { getNights } from '../calendar/dates'
import type { ReservationWithCalendarEvent } from 'types/calendar'
import { formatTimeWithZone } from 'utils/dateFormats'
import { formatAddress } from 'utils/vesta'
import type { RevenueWithFeesAndTaxes } from 'types/revenue'

class NotificationService {
  private readonly listingService: ListingService

  constructor(
    private readonly organizationId: string,
    private readonly prisma: Prisma.TransactionClient,
    private readonly emailService: PostmarkService
  ) {
    this.listingService = new ListingService()
  }

  public async sendNewMessageNotification(messageId: string) {
    const message = await this.prisma.message.findUniqueOrThrow({
      where: { id: messageId },
      include: { messageThread: { include: { guest: true } } },
    })
    const listing = await this.listingService.getOne(
      message.messageThread.listingId
    )

    const data = {
      messageThreadId: message.messageThreadId,
      listingId: message.messageThread.listingId,
      guestName: message.messageThread.guest.name,
      messageText: message.message,
      messageTime: message.timestamp,
    }

    const listingName = listing?.name ?? ''

    const templateData = {
      ...data,
      listingName,
    }

    const htmlBody = render(PMNotification(templateData))
    const textBody = render(PMNotification(templateData), {
      plainText: true,
    })

    const pm = await this.listingService.getPm(data.listingId)
    const fromString = DateTime.fromISO(
      message.messageThread.dateFrom
    ).toLocaleString(DateTime.DATE_FULL)

    const toString = DateTime.fromISO(
      message.messageThread.dateTo
    ).toLocaleString(DateTime.DATE_FULL)

    const subject = `Re: ${data.guestName} at ${listingName} for ${fromString} - ${toString}`

    await this.emailService.sendEmail({
      to: pm.email ?? '',
      subject,
      htmlBody,
      textBody,
    })
  }

  public async sendDirectGuestNotification(messageId: string) {
    const message = await this.prisma.message.findUniqueOrThrow({
      where: { id: messageId },
      include: { messageThread: { include: { guest: true } } },
    })

    if (!message.messageThread.guest.email) {
      console.log('No email found for guest')
      return
    }

    const listing = await this.listingService.getOne(
      message.messageThread.listingId
    )
    const pm = await this.listingService.getPm(message.messageThread.listingId)

    const data = {
      guestName: message.messageThread.guest.name,
      messageText: message.message,
      messageTime: message.timestamp,
    }

    const listingName = listing?.name ?? ''
    const listingPmName = pm?.name ?? ''
    const ListingPmOrgName = pm?.organization?.name ?? ''
    const guestEmail = message.messageThread.guest.email

    const fromString = DateTime.fromISO(
      message.messageThread.dateFrom
    ).toLocaleString(DateTime.DATE_FULL)

    const toString = DateTime.fromISO(
      message.messageThread.dateTo
    ).toLocaleString(DateTime.DATE_FULL)

    const subject = `Re: ${data.guestName} at ${listingName} for ${fromString} - ${toString}`

    const templateData = {
      ...data,
      listingPmName,
      ListingPmOrgName,
      headerText: subject,
    }

    const htmlBody = render(GuestNotification(templateData))
    const textBody = render(GuestNotification(templateData), {
      plainText: true,
    })

    const replyTo = `vesta+${this.organizationId}-${message.messageThread.id}@${
      process.env.POSTMARK_INBOUND_ADDRESS ?? 'inbound.getvesta.io'
    }`

    await this.emailService.sendEmail({
      to: guestEmail,
      subject,
      htmlBody,
      textBody,
      replyTo,
    })
  }

  public async sendVrboGuestNotification(messageId: string) {
    const message = await this.prisma.message.findUniqueOrThrow({
      where: { id: messageId },
      include: { messageThread: { include: { guest: true } } },
    })

    if (!message.messageThread.replyTo) {
      console.log('No replyTo email found for guest')
      return
    }

    await this.emailService.sendEmail({
      to: message.messageThread.replyTo,
      subject: '',
      htmlBody: message.message,
      textBody: message.message,
    })
  }

  public async sendDirectBookingNotification(
    reservation: ReservationWithCalendarEvent,
    messageThread: MessageThread
  ) {
    const pm = await this.listingService.getPm(
      reservation.calendarEvent.listingId
    )

    const fromString = DateTime.fromISO(
      reservation.calendarEvent.fromDate.toISOString()
    ).toLocaleString(DateTime.DATE_FULL)

    const toString = DateTime.fromISO(
      reservation.calendarEvent.toDate.toISOString()
    ).toLocaleString(DateTime.DATE_FULL)

    const guestName = reservation.guest.name
    const propertyName = reservation.calendarEvent.listing.name
    const dateRange = `${fromString} - ${toString}`
    const subject = `${guestName} booked ${propertyName} for ${dateRange}`

    const templateData = {
      messageThreadId: messageThread.id,
      guestName,
      propertyName,
      dateRange,
    }

    const htmlBody = render(DirectBookingNotification(templateData))
    const textBody = render(DirectBookingNotification(templateData), {
      plainText: true,
    })

    await this.emailService.sendEmail({
      to: pm.email ?? '',
      subject,
      htmlBody,
      textBody,
    })
  }

  public async sendDirectBookingGuestConfirmation(
    reservation: ReservationWithCalendarEvent,
    revenue: RevenueWithFeesAndTaxes | null,
    messageThread: MessageThread
  ) {
    if (!reservation.guest.email) return

    const listing = await this.listingService.getOne(
      reservation.calendarEvent.listingId
    )

    if (!listing) {
      throw new Error(
        `Listing not found: ${reservation.calendarEvent.listingId}`
      )
    }

    const logoUrl = reservation.calendarEvent.listing.organization.logoUrl
    const orgName = reservation.calendarEvent.listing.organization.name
    const listingImgUrl = listing.content?.photos[0]
    const listingName = listing.content?.title
    const propertyType = listing.unitType
    const confirmationCode = reservation.confirmationCode

    const fromDate = reservation.calendarEvent.fromDate
    const toDate = reservation.calendarEvent.toDate
    const checkInTime = formatTimeWithZone(fromDate, listing.timeZone)
    const checkOutTime = formatTimeWithZone(toDate, listing.timeZone)

    const checkInDate = DateTime.fromJSDate(fromDate).toLocaleString(
      DateTime.DATE_FULL
    )
    const checkOutDate = DateTime.fromJSDate(toDate).toLocaleString(
      DateTime.DATE_FULL
    )

    const inlineAddress = formatAddress(listing)
    const numberOfNights = getNights(
      reservation.calendarEvent.fromDate,
      reservation.calendarEvent.toDate
    )
    const numGuests = reservation.adults + reservation.children

    const summary = !!revenue
      ? new RevenueSummaryBuilder(revenue, numberOfNights).build().getSummary()
      : null

    const totalCost = summary?.grossBookingValue.amount || 0
    const accommodationRevenue =
      summary?.accommodationRevenue.taxableRevenue.amount || 0

    const fees = summary?.guestFeeRevenue.guestFees.map(({ name, amount }) => ({
      name,
      value: amount.amount,
    }))

    const taxes = summary?.allTaxes.map(({ description, value }) => ({
      name: description,
      value: value.amount,
    }))

    const templateData = {
      logoUrl,
      listingImgUrl,
      listingName,
      propertyType,
      orgName,
      confirmationCode,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      inlineAddress,
      numGuests,
      totalCost,
      accommodationRevenue,
      fees,
      taxes,
    }

    const htmlBody = render(DirectBookingGuestConfirmation(templateData))
    const textBody = render(DirectBookingGuestConfirmation(templateData), {
      plainText: true,
    })

    const fromAddress = `${orgName} via Vesta <reservations@getvesta.io>`
    const replyToAddress = `vesta+${this.organizationId}-${messageThread.id}@${fromAddress}`
    const subject = `Reservation confirmed for ${listingName ?? checkInDate}`
    const bccAddress = listing.propertyManager.email

    await this.emailService.sendEmail({
      to: reservation.guest.email,
      subject,
      htmlBody,
      textBody,
      from: fromAddress,
      bcc: bccAddress,
      replyTo: replyToAddress,
    })
  }
}

export default NotificationService
