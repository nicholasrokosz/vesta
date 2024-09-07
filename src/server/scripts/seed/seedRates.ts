import { prisma } from 'server/db'
import ServiceFactory from 'server/services/serviceFactory'
import { PROPERTY_VINE_ORG_NAME } from '../../../../prisma/seeds/vine'
import { GREENFIELD_ORG_NAME } from '../../../../prisma/seeds/greenfield'

async function seedRates() {
  console.log(`Seeding rates for seed data...`)

  const organizations = await prisma.organization.findMany({
    where: {
      name: {
        in: [PROPERTY_VINE_ORG_NAME, GREENFIELD_ORG_NAME],
      },
    },
  })

  for (const organization of organizations) {
    const factory = new ServiceFactory(prisma, organization.id)
    const ratesService = factory.getRatesService()

    const listings = await factory
      .getListingService()
      .getAllByOrganization(organization.id)

    for (const listing of listings) {
      const pricing = await ratesService.getPricing(listing.id)
      if (!pricing) {
        console.log(
          `No pricing found for listing ${listing.name} [${listing.id}]. Skipping...`
        )
        continue
      }
      factory
        .getRatesService()
        .upsertPricing({
          listingId: listing.id,
          minimum: pricing.minimum,
          weekday: pricing.weekday,
          weekend: pricing.weekend,
          minStay: pricing.minStay,
          maxStay: pricing.maxStay,
          dates: pricing.dates,
          discounts: pricing.discounts,
          dynamicPricing: 'None', // Generate rates without integration dependencies
        })
        .then(() => {
          console.log(
            `Seeded rates for listing ${listing.name} [${listing.id}].`
          )
        })
        .catch((e) => {
          const error = e as Error
          console.log(
            `Error seeding rates for listing ${listing.name} [${listing.id}]: ${error.message}`
          )
        })
    }
  }
}

seedRates()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
