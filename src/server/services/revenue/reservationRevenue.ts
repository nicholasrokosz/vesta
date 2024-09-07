// TODO: These functions are used to calculate the revenue for a reservation, not to display it.
import type { RevenueFee, RevenueFeeCreate } from 'types/revenue'
import { FeeType, FeeUnit } from 'types'

export const getTaxes = (
  totalRevenue: number,
  pmcShare: number,
  taxRates: {
    municipal: number
    county: number
    state: number
  }
) => {
  const output = []

  output.push(
    getTaxItem('Municipal tax', taxRates.municipal, totalRevenue, pmcShare)
  )

  output.push(getTaxItem('County tax', taxRates.county, totalRevenue, pmcShare))

  output.push(getTaxItem('State tax', taxRates.state, totalRevenue, pmcShare))

  return {
    taxes: output,
    total: output.reduce((acc, curr) => {
      return acc + curr.total
    }, 0),
  }
}

const getPmcShare = (listingPmcShare: number) => {
  return listingPmcShare * 0.01
}

const getOwnerShare = (listingPmcShare: number) => {
  return 1 - getPmcShare(listingPmcShare)
}

const getTaxItem = (
  type: string,
  taxRate: number,
  preTaxAmount: number,
  pmcSharePercentage: number
) => {
  const pmcShare = getPmcShare(pmcSharePercentage)
  const ownerShare = getOwnerShare(pmcSharePercentage)
  const value = preTaxAmount * (taxRate * 0.01)

  return {
    text: type,
    total: value,
    manager: value * pmcShare,
    owner: value * ownerShare,
  }
}

export const getGuestFees = (
  fees: RevenueFeeCreate[],
  resGuests: number,
  resNights: number,
  listingMaxGuests: number,
  taxRates: {
    municipal: number
    county: number
    state: number
  },
  adjustFeeValue: boolean
) => {
  if (!fees) return { fees: [], total: 0 }

  const guestFees = fees.map((fee) =>
    mapFee(
      fee,
      resGuests,
      resNights,
      listingMaxGuests,
      taxRates,
      adjustFeeValue
    )
  )

  return {
    fees: guestFees,
    total: guestFees.reduce((acc, curr) => {
      return acc + curr.value
    }, 0),
  }
}

const mapFee = (
  fee: RevenueFeeCreate,
  resGuests: number,
  resNights: number,
  listingMaxGuests: number,
  taxRates: {
    municipal: number
    county: number
    state: number
  },
  adjustFeeValue: boolean
): RevenueFee => {
  const adjustedValue = adjustFeeValue
    ? getAdjustedFeeValue(
        { value: fee.value, unit: fee.unit },
        resNights,
        resGuests,
        listingMaxGuests
      )
    : fee.value

  return {
    name: fee.name,
    value: adjustedValue,
    unit: fee.unit,
    taxable: fee.taxable,
    pmcShare: fee.pmcShare,
    taxes: fee.taxable
      ? getTaxes(adjustedValue, fee.pmcShare, taxRates).taxes.map((tax) => ({
          description: tax.text,
          value: tax.total,
        }))
      : [],
  }
}

const getAdjustedFeeValue = (
  fee: { value: number; unit: string },
  nights: number,
  guests: number,
  maxGuests: number
) => {
  let adjustedValue = fee.value

  switch (fee.unit) {
    case FeeUnit.PerDay:
      adjustedValue = fee.value * nights
      break
    case FeeUnit.PerPerson:
      adjustedValue = fee.value * guests
      break
    case FeeUnit.PerDayPerPerson:
      adjustedValue = fee.value * guests * nights
      break
    case FeeUnit.PerDayPerPersonExtra:
      if (guests <= maxGuests) break
      adjustedValue = fee.value * (guests - maxGuests)
      break

    default:
      break
  }
  return adjustedValue
}

export const feeIsApplicaable = (
  fee: {
    id: string
    name: string
    share: number
    taxable: boolean
    type: string
    unit: string
    value: number
  },
  guests: number,
  maxGuests: number,
  pets: boolean
) => {
  // Pet fee's type is CleaningFee, so unfortunately we have to check the name
  if (fee.name === 'Pet fee' && pets === false) return false
  if (fee.type === FeeType.CleaningFee) return true
  if (fee.unit === FeeUnit.PerDayPerPersonExtra && guests <= maxGuests)
    return false
  return true
}
