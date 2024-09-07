import type { Prisma } from '@prisma/client'

import PropertyManagmentCompanyApi from 'server/integrations/bookingpal/pmc'
import { BookingPalService } from './channels/bookingpal'
import GuestService from './guest'
import BpMessageThreadService from './messages/bpMessageThread'
import ExpenseService from './expenses'
import RateService from './rates'
import RevenueService from './revenue'
import OwnerStatementService from './ownerstatements'
import ReservationService from './reservation'
import NotificationService from './notification'
import MessagingService from './messages'
import PlaidService from './plaid'
import PostmarkService from 'server/integrations/postmark'
import EmailService from './email'
import PriceLabsService from './pricelabs'
import PriceLabsApi from 'server/integrations/pricelabs/api'
import ListingService from './listing'
import CalendarService from './calendar'
import UserService from './user/user'
import ReconciliationService from './reconciliation'
import AutomationsService from './automations'

class ServiceFactory {
  static async fromListingId(
    prisma: Prisma.TransactionClient,
    listingId: string
  ): Promise<ServiceFactory> {
    const listing = await prisma.listing.findUniqueOrThrow({
      where: { id: listingId },
    })
    return new ServiceFactory(prisma, listing?.organizationId)
  }

  static async fromICalKey(
    prisma: Prisma.TransactionClient,
    iCalKey: string
  ): Promise<ServiceFactory> {
    const listing = await prisma.listing.findUniqueOrThrow({
      where: { iCalKey: iCalKey },
    })
    return new ServiceFactory(prisma, listing?.organizationId)
  }

  static async fromListingKey(
    prisma: Prisma.TransactionClient,
    key: string
  ): Promise<ServiceFactory> {
    const listingKey = await prisma.listingKey.findUniqueOrThrow({
      where: { id: key },
      include: { listing: true },
    })
    return new ServiceFactory(prisma, listingKey.listing.organizationId)
  }

  constructor(
    private readonly prisma: Prisma.TransactionClient,
    private readonly organizationId: string
  ) {}

  getListingService() {
    return new ListingService()
  }

  getCalendarService() {
    return new CalendarService(
      this.getGuestService(),
      this.getMessagingService(),
      this.getBookingPalService(),
      this.getRevenueService(),
      this.getRatesService(),
      this.getNotificationService(),
      this.getAutomationsService(),
      this.prisma.listing,
      this.prisma.calendarEvent,
      this.prisma.reservation,
      this.organizationId
    )
  }

  getBookingPalService() {
    return new BookingPalService(
      this.prisma,
      this.organizationId,
      new PropertyManagmentCompanyApi()
    )
  }

  getGuestService() {
    return new GuestService(this.prisma.guest, this.organizationId)
  }

  getBpMessageThreadService() {
    const bpMessageThreadService = new BpMessageThreadService(
      this.prisma.messageThread,
      this.prisma.message,
      this.organizationId,
      this.getGuestService(),
      this.getBookingPalService(),
      this.getReservationService(),
      this.getNotificationService()
    )

    return bpMessageThreadService
  }

  getMessagingService() {
    return new MessagingService(
      this.organizationId,
      this.prisma.messageThread,
      this.prisma.message,
      this.prisma.listing,
      this.getGuestService(),
      this.getBookingPalService(),
      this.getNotificationService()
    )
  }

  getExpenseService() {
    return new ExpenseService(
      this.prisma.expense,
      this.prisma.listingExpense,
      this.getPlaidService(),
      this.organizationId
    )
  }

  getRatesService() {
    return new RateService(
      this.getBookingPalService(),
      this.getListingService(),
      this.prisma.pricing,
      this.prisma.dailyRate,
      this.organizationId
    )
  }

  getRevenueService() {
    const revenueService = new RevenueService(
      this.prisma,
      this.organizationId,
      this.getRatesService()
    )

    return revenueService
  }

  getOwnerStatementService() {
    const ownerStatementService = new OwnerStatementService(
      this.prisma.calendarEvent,
      this.prisma.expense,
      this.prisma.listingExpense,
      this.prisma.ownerStatement,
      this.prisma.revenue,
      this.organizationId,
      this.getUserService()
    )

    return ownerStatementService
  }

  getNotificationService() {
    return new NotificationService(
      this.organizationId,
      this.prisma,
      this.getPostmarkService()
    )
  }

  getPlaidService() {
    return new PlaidService(
      this.prisma.plaidItem,
      this.prisma.plaidAccount,
      this.prisma.plaidTransaction,
      this.organizationId
    )
  }

  getPostmarkService() {
    return new PostmarkService(process.env.POSTMARK_API_KEY ?? '')
  }

  getReservationService() {
    return new ReservationService(this.prisma.reservation, this.organizationId)
  }

  getEmailService() {
    return new EmailService(
      this.organizationId,
      this.getMessagingService(),
      this.getNotificationService(),
      this.getGuestService(),
      this.getReservationService()
    )
  }

  getPriceLabsService() {
    return new PriceLabsService(
      this.organizationId,
      new PriceLabsApi(),
      this.getListingService(),
      this.getCalendarService(),
      this.getReservationService()
    )
  }

  getUserService() {
    return new UserService(
      this.prisma.user,
      this.prisma.account,
      this.organizationId
    )
  }

  getReconciliationService() {
    return new ReconciliationService(
      this.prisma.payout,
      this.prisma.revenuePayout,
      this.prisma.plaidTransaction,
      this.prisma.revenue,
      this.organizationId,
      this.getRevenueService()
    )
  }

  getAutomationsService() {
    return new AutomationsService()
  }
}

export default ServiceFactory
