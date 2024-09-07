import type { ScheduledMessage } from '@prisma/client'
import { prisma } from 'server/db'

class ScheduledMessagesService {
  async getPending() {
    return await prisma.scheduledMessage.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: {
          lte: new Date(),
        },
      },
      include: {
        messageTemplate: true,
        reservation: { include: { guest: { include: { messageThreads: true}} } },
      },
    })
  }

  async markSent(scheduledMessage: ScheduledMessage) {
    return await prisma.scheduledMessage.update({
      where: {
        id: scheduledMessage.id,
      },
      data: {
        status: 'SENT',
        completedAt: new Date(),
      },
    })
  }

  async markFailed(scheduledMessage: ScheduledMessage, failureMessage: string) {
    return await prisma.scheduledMessage.update({
      where: {
        id: scheduledMessage.id,
      },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        failureMessage: failureMessage,
      },
    })
  }
}

export default ScheduledMessagesService
