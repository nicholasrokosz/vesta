import { PrismaClient } from '@prisma/client'
import { seedGreenfield } from './greenfield'
import { seedVine } from './vine'
const prisma = new PrismaClient()

async function main() {
  await seedVine(prisma)
  await seedGreenfield(prisma)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
