import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/db'
import ServiceFactory from 'server/services/serviceFactory'

interface iCalendarQuery {
  iCalKey?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string }>
) {
  if (req.method !== 'GET' || !req.query) {
    res.status(404).send({ message: 'bad request' })
    return
  }

  const { iCalKey } = req.query as iCalendarQuery
  if (!iCalKey) {
    res.status(404).send({ message: 'bad request' })
    return
  }

  ServiceFactory.fromICalKey(prisma, iCalKey)
    .then(async (factory) => {
      const calendar = await factory.getCalendarService().generateICal(iCalKey)
      calendar.serve(res)
    })
    .catch((error) => {
      console.error(
        `Error finding listing for [${iCalKey}]. Ignoring...`,
        error
      )
      res.status(404).send({ message: 'listing not found' })
    })
}
