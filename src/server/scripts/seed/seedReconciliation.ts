import { prisma } from 'server/db'
import { PROPERTY_VINE_ORG_NAME } from '../../../../prisma/seeds/vine'
import seedTransactions from './seedTransactions'
import seedReservations from './seedReservations'

async function seedReconciliation() {
  const organization = await prisma.organization.findFirstOrThrow({
    where: {
      name: {
        in: [PROPERTY_VINE_ORG_NAME],
      },
    },
  })

  await seedTransactions(organization.id)
  await seedReservations(organization.id)
}

seedReconciliation()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
