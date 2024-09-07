import type {
  MessageTemplate,
  MessageThread,
  ScheduledMessage,
} from '@prisma/client'
import { prisma } from 'server/db'
import AutomationsService from 'server/services/automations'
import ScheduledMessagesService from 'server/services/scheduledMessages'
import ServiceFactory from 'server/services/serviceFactory'
import { captureErrorsInSentry } from 'utils/sentry'

const scheduledMessagesService = new ScheduledMessagesService()
const automationsService = new AutomationsService()

async function processQueue() {
  console.log(`Processing scheduled messages queue...`)
  return await scheduledMessagesService
    .getPending()
    .then(async (scheduledMessages) => {
      for (const scheduledMessage of scheduledMessages) {
        const messageThread =
          scheduledMessage.reservation.guest.messageThreads.find(
            (thread) => thread.channel === scheduledMessage.reservation.channel
          )

        await processMessage(
          scheduledMessage,
          scheduledMessage.messageTemplate,
          messageThread
        )
      }

      return scheduledMessages.length
    })
}

async function processMessage(
  scheduledMessage: ScheduledMessage,
  messageTemplate: MessageTemplate,
  messageThread: MessageThread | undefined
) {
  const message = await automationsService.renderTemplate(
    messageTemplate.body,
    scheduledMessage.reservationId
  )

  if (!messageThread) {
    // TODO: What should we do if there's no messageThread?
    // Leave stuff in pending, because it might get get a thread? Or mark as failed so we don't send stale messages?
    return
  }

  const factory = new ServiceFactory(prisma, messageTemplate.organizationId)
  const messageService = factory.getMessagingService()

  await messageService
    .createMessage({
      messageThreadId: messageThread.id,
      message: message,
      user: 'PROPERTY_MANAGER',
    })
    .then(async () => {
      await scheduledMessagesService.markSent(scheduledMessage)
    })
    .catch(async (e) => {
      const error = e as Error
      await scheduledMessagesService.markFailed(scheduledMessage, error.message)
    })
}

captureErrorsInSentry(processQueue())
  .then((number) => {
    console.log(`Processed ${number} scheduled messages.`)
  })
  .catch((e) => {
    const error = e as Error
    console.log(`Error processing scheduled message queue ${error.message}`)
  })

export { processQueue }
