import { prisma } from 'server/db'
import type { Task } from 'graphile-worker'

import { PlaidTransactionPayloadSchema } from './types'
import ServiceFactory from 'server/services/serviceFactory'
import { captureException } from '@sentry/node'

const task: Task = async (payload, { logger }) => {
  const { organizationId, plaidTransactionId } =
    PlaidTransactionPayloadSchema.parse(payload)

  const reconciliationService = new ServiceFactory(
    prisma,
    organizationId
  ).getReconciliationService()

  try {
    await reconciliationService.reconcileTransaction(plaidTransactionId)
  } catch (error: unknown) {
    captureException(error)

    logger.error(`Failed to sync plaidTransaction: ${plaidTransactionId}`)
  }
}

module.exports = task
