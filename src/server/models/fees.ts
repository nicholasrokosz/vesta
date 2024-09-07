import type { PrismaClient } from '@prisma/client'
import type { FeeUpdate } from 'types'

const getByListingId = async (listingId: string, prisma: PrismaClient) => {
  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
    include: {
      fees: {
        select: {
          id: true,
          name: true,
          value: true,
          unit: true,
          taxable: true,
          type: true,
          share: true,
        },
      },
    },
  })

  return listing?.fees ?? []
}

const upsert = async (fee: FeeUpdate, prisma: PrismaClient) => {
  if (fee.id) {
    await prisma.listing.update({
      where: {
        id: String(fee.id),
      },
      data: {
        fees: {
          deleteMany: {},
        },
      },
    })
  }

  await prisma.listing.update({
    where: {
      id: String(fee.id),
    },
    data: fee,
  })
}

const FeeModel = {
  getByListingId,
  upsert,
}

export default FeeModel
