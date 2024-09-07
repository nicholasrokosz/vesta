import type { BusinessModel, TaxRates } from 'types/listings'
import type { TaxCreate, Revenue, RevenueFee } from 'types/revenue'

interface BpFee {
  id: string
  name: string
  value: number
}

interface TaxRateList {
  rates: {
    description: string
    value: number
    percent: number
  }[]
  total: number
}

export interface BpRevenuePayload {
  taxes: { id: string; name: string; value: number }[]
  fees: { id: string; name: string; value: number }[]
  commission: number
  accommodationRevenue: number
}

export const processAirbnbRevenue = (
  reservationId: string,
  businessModel: BusinessModel,
  payload: BpRevenuePayload
) => {
  const pmcShare = businessModel.deductions.pmcShare ?? 0
  const taxRates = businessModel.taxRates

  const taxes = payload.taxes.map((tax) => {
    return {
      description: tax.name,
      value: tax.value,
    }
  })

  const fees: RevenueFee[] = payload.fees.map((fee) => {
    const listingFee = businessModel.fees.find((f) => f.id === fee.id)

    if (listingFee) {
      let feeValue = fee.value
      if (taxes.length > 0 && listingFee.taxable) {
        const processedFee = processBpFee(fee, taxRates)
        feeValue = processedFee.fee

        const expectedTotal = Math.ceil(
          listingFee.value +
            processedFee.taxes.reduce((acc, cur) => acc + cur.value, 0)
        )

        // Check if computed taxes match what we got from BP
        if (expectedTotal !== fee.value) {
          console.log(
            `AirbnbTaxMismatch on reservation ${reservationId} for fee ${fee.name}: Expected fee total $${expectedTotal}, Actual $${fee.value}`
          )
        }
        return {
          name: listingFee.name,
          value: feeValue,
          unit: listingFee.unit,
          taxable: listingFee.taxable,
          pmcShare: listingFee.share,
          taxes: processedFee.taxes,
        }
      } else {
        return {
          name: listingFee.name,
          value: feeValue,
          unit: listingFee.unit,
          taxable: listingFee.taxable,
          pmcShare: listingFee.share,
          taxes: [],
        }
      }
    } else {
      return {
        name: fee.name,
        value: fee.value,
        unit: '',
        taxable: false,
        pmcShare: 0,
        taxes: [],
      }
    }
  })

  const revenue: Revenue = {
    discount: 0,
    pmcShare,
    reservationId: reservationId,
    accommodationRevenue: payload.accommodationRevenue,
    taxes,
    fees,
    channelCommission: payload.commission,
  }

  return revenue
}

export const processVrboRevenue = (
  reservationId: string,
  businessModel: BusinessModel,
  payload: BpRevenuePayload
) => {
  const pmcShare = businessModel.deductions.pmcShare ?? 0

  const taxes = payload.taxes.map((tax) => {
    const taxRate = getTaxRateFromBpTax(tax, businessModel.taxRates)

    return {
      description: tax.name,
      value: payload.accommodationRevenue * (taxRate / 100),
    }
  })

  const processedFees: {
    taxes: TaxCreate[]
  }[] = []

  const fees: RevenueFee[] = payload.fees.map((fee) => {
    const listingFee = businessModel.fees.find((f) => f.id === fee.id)

    if (listingFee) {
      if (listingFee.taxable) {
        const processedFee = processBpFee(fee, businessModel.taxRates)

        processedFees.push(processedFee)

        return {
          name: listingFee.name,
          value: fee.value,
          unit: listingFee.unit,
          taxable: listingFee.taxable,
          pmcShare: listingFee.share,
          taxes: processedFee.taxes,
        }
      } else {
        return {
          name: listingFee.name,
          value: fee.value,
          unit: listingFee.unit,
          taxable: listingFee.taxable,
          pmcShare: listingFee.share,
          taxes: [],
        }
      }
    } else {
      return {
        name: fee.name,
        value: fee.value,
        unit: '',
        taxable: false,
        pmcShare: 0,
        taxes: [],
      }
    }
  })

  const revenue: Revenue = {
    discount: 0,
    pmcShare,
    reservationId: reservationId,
    accommodationRevenue: payload.accommodationRevenue,
    taxes,
    fees,
    channelCommission: payload.commission,
  }

  // Check if computed taxes match what we got from BP
  taxes.forEach((tax) => {
    // Accommodation tax + tax of that type from each fee
    const expectedTax =
      tax.value +
      processedFees.reduce(
        (acc, cur) =>
          acc +
          (cur.taxes.find((t) => t.description === tax.description)?.value ||
            0),
        0
      )

    const actualTax =
      payload.taxes.find((t) => t.name === tax.description)?.value || 0

    if (expectedTax.toFixed(2) !== actualTax.toFixed(2)) {
      console.log(
        `VrboTaxMismatch on reservation ${reservationId} for ${tax.description}: Expected $${expectedTax}, Actual $${actualTax}`
      )
    }
  })

  return revenue
}

export const processBpFee = (bpFee: BpFee, taxRates: TaxRates) => {
  const taxRateList = getTaxRateList(taxRates)
  const feeTaxes = getFeeTaxes(taxRateList, bpFee)

  return {
    fee: feeTaxes.fee,
    taxes: feeTaxes.taxes,
  }
}

export const getFeeTaxes = (taxRateList: TaxRateList, bpFee: BpFee) => {
  const fee = bpFee.value / (1 + taxRateList.total)

  const taxes = taxRateList.rates.map((taxRate) => {
    return {
      description: taxRate.description,
      value: (fee * taxRate.value) / 100,
    }
  })

  return {
    fee,
    taxes,
  }
}

export const getTaxRateList = (taxRates: TaxRates): TaxRateList => {
  const total = taxRates.municipal + taxRates.county + taxRates.state
  const rates = []

  if (taxRates.municipal) {
    rates.push({
      description: 'Municipal tax',
      value: taxRates.municipal,
      percent: taxRates.municipal / total,
    })
  }
  if (taxRates.county) {
    rates.push({
      description: 'County tax',
      value: taxRates.county,
      percent: taxRates.county / total,
    })
  }
  if (taxRates.state) {
    rates.push({
      description: 'State tax',
      value: taxRates.state,
      percent: taxRates.state / total,
    })
  }

  return { rates, total: total / 100 }
}

export const getTaxRateFromBpTax = (
  tax: { id: string; name: string; value: number },
  rates: TaxRates
) => {
  let taxRate = 0
  const taxType = tax.id.split('-')[1]
  if (taxType === 'municipal') {
    taxRate = rates.municipal
  } else if (taxType === 'county') {
    taxRate = rates.county
  } else if (taxType === 'state') {
    taxRate = rates.state
  }

  return taxRate
}
