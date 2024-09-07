import { prisma } from 'server/db'
import ServiceFactory from 'server/services/serviceFactory'
import fs from 'fs'
import type { PlaidImportTransaction } from 'server/services/plaid/types'
import DateString from 'types/dateString'

export default async function seedTransactions(organizationId: string) {
  console.log(`Seeding transactions with dummy data...`)
  const csvData = getData()
  const transactions = processCsv(csvData)
  //console.log(transactions)

  const factory = new ServiceFactory(prisma, organizationId)
  const plaidService = factory.getPlaidService()

  await Promise.all(
    transactions.map(async (transaction) => {
      const plaidTransaction: PlaidImportTransaction = {
        accountId: transaction.accountId,
        plaidId: transaction.plaidId,
        date: new DateString(transaction.date),
        amount: parseFloat(transaction.amount),
        vendor: transaction.vendor,
        name: transaction.name,
      }

      await plaidService.importTransaction(plaidTransaction)
    })
  )
}

const getData = () => {
  return fs.readFileSync('./src/server/scripts/seed/transactions.csv', 'utf8')
}

const processCsv = (text: string) => {
  const lines = text.split('\n').slice(1, -1)

  return lines.map((line) => {
    const [accountId, plaidId, date, amount, vendor, name] = line.split(',')

    return {
      accountId,
      plaidId,
      date,
      amount,
      vendor,
      name,
    }
  })
}
