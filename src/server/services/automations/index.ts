import type { Reservation } from '@prisma/client'
import { ReservationStatus } from '@prisma/client'
import { prisma } from 'server/db'
import type { MessageTemplateCreate } from 'types/automations'
import type { ITrigger } from 'types/automations'
import { calculateScheduledTime, getTriggerLabel, getTrigger } from './triggers'
import { MessageTagsBuilder } from './messageTags'
import renderMergeTags from 'utils/mergeTags'
import ServiceFactory from '../serviceFactory'

async function getReservations(
  listingIds: string[],
  messageTemplateId: string,
  trigger: ITrigger
) {
  // We don't want to schedule messages in the past
  const triggerCutoff = calculateScheduledTime(new Date(), new Date(), trigger)

  const query =
    trigger.type === 'CheckIn'
      ? {
          fromDate: {
            gt: triggerCutoff,
          },
          listing: {
            id: {
              in: listingIds,
            },
          },
        }
      : {
          toDate: {
            gt: triggerCutoff,
          },
          listing: {
            id: {
              in: listingIds,
            },
          },
        }

  const reservations = await prisma.reservation.findMany({
    where: {
      calendarEvent: query,
      status: {
        in: [ReservationStatus.FULLY_PAID, ReservationStatus.CONFIRMED],
      },
    },
    select: {
      calendarEvent: {
        select: {
          listing: {
            include: { messageTemplates: { where: { id: messageTemplateId } } },
          },
          fromDate: true,
          toDate: true,
        },
      },
      id: true,
    },
  })

  return reservations
}

async function addScheduledMessages(
  messageTemplate: MessageTemplateCreate,
  listingIds: string[]
) {
  if (!messageTemplate.id) return
  const messageTemplateId = messageTemplate.id
  const trigger = getTrigger(messageTemplate)
  if (!trigger) return

  const reservations = await getReservations(
    listingIds,
    messageTemplate.id,
    trigger
  )
  await prisma.$transaction(
    reservations.map((reservation) => {
      const scheduledAt = calculateScheduledTime(
        reservation.calendarEvent.fromDate,
        reservation.calendarEvent.toDate,
        trigger
      )
      return prisma.scheduledMessage.create({
        data: {
          reservationId: reservation.id,
          messageTemplateId: messageTemplateId,
          scheduledAt,
        },
      })
    })
  )
}

async function updateScheduledMessages(
  messageTemplate: MessageTemplateCreate,
  listingIds: string[]
) {
  const trigger = getTrigger(messageTemplate)

  if (!trigger) return

  // Get all unsent ScheduledMessages associated with the MessageTemplate
  const scheduledMessages = await prisma.scheduledMessage.findMany({
    where: {
      messageTemplateId: messageTemplate.id,
      status: 'PENDING',
      reservation: { calendarEvent: { listingId: { in: listingIds } } },
    },
    include: { reservation: { include: { calendarEvent: true } } },
  })

  for (const scheduledMessage of scheduledMessages) {
    const scheduledAt = calculateScheduledTime(
      scheduledMessage.reservation.calendarEvent.fromDate,
      scheduledMessage.reservation.calendarEvent.toDate,
      trigger
    )

    await prisma.scheduledMessage.update({
      where: { id: scheduledMessage.id },
      data: { scheduledAt: scheduledAt },
    })
  }
}

async function buildMessageTags(reservationId: string) {
  const builder = new MessageTagsBuilder()
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { calendarEvent: true, guest: true },
  })
  if (!reservation) return builder

  builder.appendReservation(reservation)
  builder.appendGuest(reservation.guest)

  const calendarEvent = await prisma.calendarEvent.findUnique({
    where: {
      id: reservation?.calendarEventId,
    },
    include: {
      listing: {
        include: {
          content: true,
          propertyManager: true,
          fees: true,
        },
      },
    },
  })

  if (!!calendarEvent) {
    const zone: string = calendarEvent.listing?.timeZone ?? 'US/Eastern'
    builder.appendCalendarEvent(calendarEvent, zone)
    builder.appendListing(calendarEvent.listing)
    builder.appendListingContent(calendarEvent.listing?.content)
    builder.appendPropertyManager(calendarEvent.listing?.propertyManager)
    builder.appendCleaningFee(calendarEvent.listing?.fees)
  }

  return builder
}

async function deleteScheduledMessages(
  templateId: string,
  listingIds: string[]
) {
  try {
    await prisma.scheduledMessage.deleteMany({
      where: {
        messageTemplateId: templateId,
        reservation: { calendarEvent: { listingId: { in: listingIds } } },
      },
    })
  } catch (error) {
    console.error('Error deleting scheduled messages:', error)
  }
}

class AutomationsService {
  async setEnabled(data: { id: string; enabled: boolean }) {
    if (data.enabled) {
      const template = await prisma.messageTemplate.update({
        where: {
          id: data.id,
        },
        include: {
          listings: true,
        },
        data,
      })
      if (template.trigger) {
        const listingIds = template.listings.map((l) => l.id)
        let newListingIds = listingIds || []

        if (template.allListings) {
          const listings = await prisma.listing.findMany({
            where: { organizationId: template.organizationId },
          })

          newListingIds = listings.map((l) => l.id)
        }
        await addScheduledMessages(template, newListingIds)
      }
    } else {
      await prisma.messageTemplate.update({
        where: {
          id: data.id,
        },
        data: {
          ...data,
          scheduledMessages: {
            deleteMany: {},
          },
        },
      })
    }
  }

  async upsertMessageTemplate(
    messageTemplate: MessageTemplateCreate,
    organizationId: string
  ) {
    const { listingIds, ...prismaTemplate } = messageTemplate
    let newListingIds = listingIds || []

    if (messageTemplate.allListings) {
      const listings = await prisma.listing.findMany({
        where: { organizationId: organizationId },
      })

      newListingIds = listings.map((l) => l.id)
    }

    if (!messageTemplate.id) {
      const newMessageTemplate = await prisma.messageTemplate.create({
        data: {
          ...prismaTemplate,
          organizationId: organizationId,
          listings: {
            connect: newListingIds.map((id) => ({ id })),
          },
        },
      })

      if (messageTemplate.trigger) {
        await addScheduledMessages(newMessageTemplate, newListingIds)
      }
    } else {
      const oldTemplate = await prisma.messageTemplate.findUnique({
        where: { id: messageTemplate.id },
      })

      await prisma.messageTemplate.update({
        where: {
          id: messageTemplate.id,
        },
        data: prismaTemplate,
      })

      const currentListings = await prisma.listing.findMany({
        where: { messageTemplates: { some: { id: messageTemplate.id } } },
        select: { id: true },
      })

      const currentListingIds = currentListings.map((listing) => listing.id)
      const removedListings = currentListingIds.filter(
        (listingId) => !newListingIds.includes(listingId)
      )
      const addedListings = newListingIds.filter(
        (listingId) => !currentListingIds.includes(listingId)
      )
      const existingListings = newListingIds.filter((listingId) => {
        currentListingIds.includes(listingId)
      })

      // Disconnect all listings currently associated with the message template
      // and connect the new ones.
      await prisma.messageTemplate.update({
        where: { id: messageTemplate.id },
        data: {
          listings: {
            set: [],
          },
        },
      })

      await prisma.messageTemplate.update({
        where: { id: messageTemplate.id },
        data: {
          listings: {
            connect: newListingIds.map((listingId) => ({ id: listingId })),
          },
        },
      })

      if (messageTemplate.trigger && !oldTemplate?.trigger) {
        // Trigger is added
        await addScheduledMessages(messageTemplate, newListingIds)
      } else if (messageTemplate.trigger && oldTemplate?.trigger) {
        // Trigger is updated
        await deleteScheduledMessages(messageTemplate.id, removedListings)
        await addScheduledMessages(messageTemplate, addedListings)
        await updateScheduledMessages(messageTemplate, existingListings)
      } else if (!messageTemplate.trigger && oldTemplate?.trigger) {
        // Trigger is removed
        await deleteScheduledMessages(messageTemplate.id, currentListingIds)
      }
    }
  }

  async processCancelReservation(reservationId: string) {
    await prisma.scheduledMessage.deleteMany({
      where: {
        status: 'PENDING',
        reservation: { id: reservationId },
      },
    })
  }

  async processUpdateReservation(reservationId: string) {
    const scheduledMessages = await prisma.scheduledMessage.findMany({
      where: {
        status: 'PENDING',
        reservation: { id: reservationId },
      },
      include: {
        messageTemplate: true,
        reservation: { include: { calendarEvent: true } },
      },
    })

    for (const scheduledMessage of scheduledMessages) {
      const trigger = getTrigger(scheduledMessage.messageTemplate)
      if (!trigger) throw new Error('Trigger not found')

      const scheduledAt = calculateScheduledTime(
        scheduledMessage.reservation.calendarEvent.fromDate,
        scheduledMessage.reservation.calendarEvent.toDate,
        trigger
      )

      await prisma.scheduledMessage.update({
        where: { id: scheduledMessage.id },
        data: { scheduledAt: scheduledAt },
      })
    }
  }

  async processNewReservation(reservation: Reservation) {
    const reservationTemplates = await prisma.reservation.findUnique({
      where: { id: reservation.id },
      include: {
        calendarEvent: {
          include: {
            listing: {
              include: {
                messageTemplates: {
                  where: {
                    enabled: true,
                    trigger: {
                      not: null,
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
    if (!reservationTemplates) return

    const messageTemplates =
      reservationTemplates.calendarEvent.listing.messageTemplates
    await prisma.$transaction(
      messageTemplates.map((messageTemplate) => {
        const trigger = getTrigger(messageTemplate)
        if (!trigger) throw new Error('Trigger not found')

        // TODO: Do this in update reservation
        const scheduledAt =
          reservation.status === 'CONFIRMED' &&
          messageTemplate.trigger === 'ReservationConfirmed'
            ? new Date()
            : calculateScheduledTime(
                reservationTemplates.calendarEvent.fromDate,
                reservationTemplates.calendarEvent.toDate,
                trigger
              )

        return prisma.scheduledMessage.create({
          data: {
            reservationId: reservation.id,
            messageTemplateId: messageTemplate.id,
            scheduledAt: scheduledAt,
          },
        })
      })
    )
  }

  async getAll(organizationId: string) {
    const data = await prisma.messageTemplate.findMany({
      where: {
        organizationId: organizationId,
      },
      include: {
        listings: {
          select: { name: true, content: { select: { photos: true } } },
        },
        scheduledMessages: true,
      },
    })

    const all = data.map((mt) => ({
      id: mt.id,
      title: mt.title,
      body: mt.body,
      enabled: mt.enabled,
      triggerName: getTriggerLabel(mt.trigger ?? undefined),
      allListings: mt.allListings,
      listings: mt.listings.map((l) => ({
        name: l.name,
        photo: l.content?.photos[0] ?? '',
      })),
      scheduledMessages: mt.scheduledMessages,
    }))

    const messageTemplates = {
      all,
      canned: all.filter((vm) => vm.triggerName === ''),
      triggers: all.filter((vm) => vm.triggerName !== ''),
    }

    return messageTemplates
  }

  async getRenderedCannedMessages(messageThreadId: string) {
    const messageThread = await prisma.messageThread.findUniqueOrThrow({
      where: { id: messageThreadId },
      include: {
        listing: {
          include: {
            messageTemplates: {
              where: { enabled: true, trigger: null },
            },
          },
        },
      },
    })
    const factory = new ServiceFactory(
      prisma,
      messageThread.listing.organizationId
    )
    const reservation = await factory
      .getGuestService()
      .getMostRecentReservation(messageThread.guestId, messageThread.channel)

    const templates = messageThread.listing.messageTemplates
    if (!templates || !reservation) {
      return []
    }

    const builder = await buildMessageTags(reservation.id)
    const result = templates.map((template) => {
      return {
        id: template.id,
        title: template.title,
        body: renderMergeTags(template.body, builder.getTags()),
      }
    })

    return result
  }

  async renderTemplate(template: string, reservationId: string) {
    const builder = await buildMessageTags(reservationId)
    return renderMergeTags(template, builder.getTags())
  }

  async getOne(id: string) {
    const messageTemplate = await prisma.messageTemplate.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        title: true,
        body: true,
        bodyHtml: true,
        trigger: true,
        triggerRange: true,
        triggerUnit: true,
        triggerValue: true,
        allListings: true,
        listings: { select: { id: true } },
      },
    })
    if (!messageTemplate) throw new Error('Message template not found')

    return {
      id: messageTemplate.id,
      title: messageTemplate.title,
      body: messageTemplate.body,
      bodyHtml: messageTemplate.bodyHtml ?? '',

      trigger: messageTemplate.trigger,
      triggerRange: messageTemplate.triggerRange,
      triggerUnit: messageTemplate.triggerUnit,
      triggerValue: messageTemplate.triggerValue,
      allListings: messageTemplate.allListings,
      listingIds: messageTemplate.allListings
        ? []
        : messageTemplate.listings.map((l) => l.id),
    }
  }
}

export default AutomationsService
