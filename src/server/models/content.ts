import type { PrismaClient } from '@prisma/client'
import type { Content } from 'types/listings'

const getByListingId = async (listingId: string, prisma: PrismaClient) => {
  const content = await prisma.content.findUnique({
    where: {
      listingId,
    },
    include: {
      bedrooms: {
        select: {
          type: true,
          bathroom: true,
          beds: true,
        },
      },
    },
  })

  return content
}

const upsert = async (content: Content, prisma: PrismaClient) => {
  if (content.id) {
    await prisma.content.update({
      where: {
        id: content.id,
      },
      data: {
        bedrooms: {
          deleteMany: {},
        },
      },
    })
  }

  const contentInput = {
    ...content,
    bedrooms: {
      createMany: { data: content.bedrooms },
    },
  }

  await prisma.content.upsert({
    where: {
      listingId: content.listingId,
    },
    update: contentInput,
    create: contentInput,
  })
}

const ContentModel = {
  upsert,
  getByListingId,
}

export default ContentModel
