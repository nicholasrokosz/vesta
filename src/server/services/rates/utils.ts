import { DateTime } from 'luxon'
import { DynamicPricing } from '@prisma/client'
import type { Pricing } from 'types/pricing'
import type { Price } from './types'
import DateString from 'types/dateString'

export const getDateRange = (
  startDate: DateString,
  endDate: DateString,
  pricing: Pricing
) => {
  const days: Price[] = []
  for (let i = 0; i <= endDate.compareToDateString(startDate); i++) {
    const day = DateString.fromString(
      startDate.toDateTime().plus({ days: i }).toISODate()
    )

    const minStay = pricing.minStay

    let rate = getDayBasePrice(day, pricing)
    const dayDiscount = getDiscount(day, pricing)

    if (dayDiscount) {
      rate = (rate * dayDiscount.percent) / 100
    }

    if (
      pricing.dynamicPricing === DynamicPricing.None &&
      rate < pricing.minimum
    ) {
      rate = pricing.minimum
    }

    days.push({ date: day, price: Math.round(rate), minStay })
  }

  return days
}

//TODO: Write tests and use DateString compare.
export const getDiscount = (day: DateString, pricing: Pricing) => {
  if (!pricing.dates) return null

  const dateTime = day.toDateTime()
  const discount = pricing.dates.find((pricingDate) => {
    return (
      DateTime.fromJSDate(pricingDate.startDate).startOf('day') <=
        dateTime.startOf('day') &&
      DateTime.fromJSDate(pricingDate.endDate).startOf('day') >=
        dateTime.startOf('day')
    )
  })
  return discount || null
}

export const getDayBasePrice = (day: DateString, pricing: Pricing): number => {
  const dateTime = day.toDateTime()
  const dynamicPricing = pricing.dynamicPricing
  switch (dynamicPricing) {
    case DynamicPricing.PriceLabs:
      return pricing.minimum
    case DynamicPricing.None:
      return dateTime.weekday === 5 || dateTime.weekday === 6
        ? pricing.weekend
        : pricing.weekday
  }
}
