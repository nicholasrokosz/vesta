import type { PrismaClient } from '@prisma/client'
import type { AmenityUpdate } from 'types'

const getByListingId = async (listingId: string, prisma: PrismaClient) => {
  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
    include: {
      amenities: { select: { typeId: true, note: true } },
    },
  })

  return listing?.amenities ?? []
}

const upsert = async (amenity: AmenityUpdate, prisma: PrismaClient) => {
  if (amenity.id) {
    await prisma.listing.update({
      where: {
        id: String(amenity.id),
      },
      data: {
        amenities: {
          deleteMany: {},
        },
      },
    })
  }

  await prisma.listing.update({
    where: {
      id: String(amenity.id),
    },
    data: amenity,
  })
}

const AmenityModel = {
  getByListingId,
  upsert,
}

export default AmenityModel
