import { createTRPCRouter, protectedProcedure } from '../trpc'
import AddressFormatter from '@shopify/address'

const SUPPORTED_COUNTRIES = ['CA', 'CR', 'JM', 'MX', 'US']

export const addressesRouter = createTRPCRouter({
  getCountries: protectedProcedure.query(async ({}) => {
    const addressFormatter = new AddressFormatter('en')
    const countries = await addressFormatter.getCountries()

    return countries.filter((country) =>
      SUPPORTED_COUNTRIES.includes(country.code)
    )
  }),
})
