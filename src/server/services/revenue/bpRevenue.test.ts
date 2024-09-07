import {
  getTaxRateList,
  getFeeTaxes,
  processAirbnbRevenue,
  processVrboRevenue,
  getTaxRateFromBpTax,
} from './bpRevenue'
import type { BusinessModel } from 'types/listings'

describe('BP Revenue', () => {
  const reservationId = 'some-reservation-id'

  describe('getTaxRateList', () => {
    it('gets the correct values', () => {
      const result = getTaxRateList({
        municipal: 1.4,
        county: 3,
        state: 2,
      })

      expect(result.total).toEqual(0.064)
      expect(result.rates.length).toEqual(3)
      expect(result.rates[0].percent.toPrecision(2)).toEqual('0.22')
      expect(result.rates[1].percent.toPrecision(2)).toEqual('0.47')
      expect(result.rates[2].percent.toPrecision(2)).toEqual('0.31')
    })
  })

  describe('getTaxRateFromBpTax', () => {
    it('gets the correct values', () => {
      const result = getTaxRateFromBpTax(
        { id: 'clk04vdkx000ot222kvdt04v1-state', name: '', value: 0 },
        {
          municipal: 1.4,
          county: 3,
          state: 2,
        }
      )

      expect(result).toEqual(2)
    })
  })

  describe('getFeeTaxes', () => {
    it('gets the correct values', () => {
      const result = getFeeTaxes(
        {
          rates: [
            {
              description: 'Municipal tax',
              value: 1.4,
              percent: 0.21874999999999997,
            },
            { description: 'County tax', value: 3, percent: 0.46875 },
            { description: 'State tax', value: 2, percent: 0.3125 },
          ],
          total: 0.064,
        },
        {
          id: '',
          name: '',
          value: 107,
        }
      )

      expect(result.fee.toPrecision(5)).toEqual('100.56')
      expect(result.taxes.length).toEqual(3)
      expect(result.taxes[0].value.toPrecision(3)).toEqual('1.41')
      expect(result.taxes[1].value.toPrecision(3)).toEqual('3.02')
      expect(result.taxes[2].value.toPrecision(3)).toEqual('2.01')
    })
  })

  describe('processAirbnbRevenue', () => {
    let businessModel: BusinessModel

    beforeEach(() => {
      businessModel = {
        fees: [
          {
            id: 'cllbpup6m0005uwrodz6mxzt2',
            name: 'feeNameFromVesta',
            value: 100,
            unit: 'fixed',
            taxable: true,
            share: 22,
            type: 'Guest',
          },
        ],
        taxRates: {
          state: 5,
          municipal: 2,
          county: 3,
        },
        deductions: {
          listingId: '',
          channelFees: false,
          creditCardFees: false,
          discounts: false,
          municipalTaxes: false,
          countyTaxes: false,
          stateTaxes: false,
          otherGuestFees: false,
          pmcShare: 30,
        },
        airbnbRemitsTaxes: false,
      }
    })

    it('gets the correct values', () => {
      const result = processAirbnbRevenue(reservationId, businessModel, {
        taxes: [{ id: 'taxId', name: 'taxName', value: 5 }],
        fees: [
          {
            id: 'cllbpup6m0005uwrodz6mxzt2',
            name: 'feeNameFromBp',
            value: 110,
          },
          {
            id: 'cllbph1uo003iuwdc0pinj750',
            name: 'feeNameFromBp2',
            value: 50,
          },
        ],
        commission: 66,
        accommodationRevenue: 55,
      })

      expect(result.reservationId).toEqual('some-reservation-id')
      expect(result.accommodationRevenue).toEqual(55)
      expect(result.channelCommission).toEqual(66)
      expect(result.fees.length).toEqual(2)

      // Fees found in the business model use those values
      expect(result.fees[0].value.toPrecision(3)).toEqual('100')
      expect(result.fees[0].name).toEqual('feeNameFromVesta')
      expect(result.fees[0].unit).toEqual('fixed')
      expect(result.fees[0].pmcShare).toEqual(22)
      expect(result.fees[0].taxable).toEqual(true)
      expect(result.fees[0].taxes.length).toEqual(3)

      const sortedTaxes = result.fees[0].taxes.sort((a, b) =>
        a.description.localeCompare(b.description)
      )
      expect(sortedTaxes[0].value).toBeCloseTo(3) // County
      expect(sortedTaxes[1].value).toBeCloseTo(2) // Municipal
      expect(sortedTaxes[2].value).toBeCloseTo(5) // State

      // Fees not found in the business model are copied over with defaults
      expect(result.fees[1].value).toEqual(50)
      expect(result.fees[1].name).toEqual('feeNameFromBp2')
      expect(result.fees[1].unit).toEqual('')
      expect(result.fees[1].taxable).toEqual(false)
      expect(result.fees[1].taxes.length).toEqual(0)
      expect(result.fees[1].pmcShare).toEqual(0)

      expect(result.taxes.length).toEqual(1)
      expect(result.taxes[0].value).toEqual(5)
      expect(result.taxes[0].description).toEqual('taxName')
    })

    it('will ignore taxes if none are in the payload–assumes Airbnb is remitting', () => {
      const result = processAirbnbRevenue(reservationId, businessModel, {
        taxes: [],
        fees: [
          {
            id: 'cllbpup6m0005uwrodz6mxzt2',
            name: 'feeNameFromBp',
            value: 100,
          },
          {
            id: 'cllbph1uo003iuwdc0pinj750',
            name: 'feeNameFromBp2',
            value: 50,
          },
        ],
        commission: 66,
        accommodationRevenue: 55,
      })

      expect(result.reservationId).toEqual('some-reservation-id')
      expect(result.accommodationRevenue).toEqual(55)
      expect(result.channelCommission).toEqual(66)
      expect(result.fees.length).toEqual(2)

      // Fees found in the business model use those values
      expect(result.fees[0].value).toEqual(100)
      expect(result.fees[0].name).toEqual('feeNameFromVesta')
      expect(result.fees[0].unit).toEqual('fixed')
      expect(result.fees[0].pmcShare).toEqual(22)
      expect(result.fees[0].taxable).toEqual(true)
      expect(result.fees[0].taxes.length).toEqual(0)

      // Fees not found in the business model are copied over with defaults
      expect(result.fees[1].value).toEqual(50)
      expect(result.fees[1].name).toEqual('feeNameFromBp2')
      expect(result.fees[1].unit).toEqual('')
      expect(result.fees[1].pmcShare).toEqual(0)
      expect(result.fees[1].taxable).toEqual(false)
      expect(result.fees[0].taxes.length).toEqual(0)

      expect(result.taxes.length).toEqual(0)
    })
  })

  describe('processVrboRevenue', () => {
    let businessModel: BusinessModel

    beforeEach(() => {
      businessModel = {
        fees: [
          {
            id: 'cllbpup6m0005uwrodz6mxzt2',
            name: 'feeNameFromVesta',
            value: 100,
            unit: 'fixed',
            taxable: true,
            share: 33,
            type: 'Guest',
          },
        ],
        taxRates: {
          state: 5,
          municipal: 2,
          county: 3,
        },
        deductions: {
          listingId: '',
          channelFees: false,
          creditCardFees: false,
          discounts: false,
          municipalTaxes: false,
          countyTaxes: false,
          stateTaxes: false,
          otherGuestFees: false,
          pmcShare: 20,
        },
        airbnbRemitsTaxes: false,
      }
    })

    it('gets the correct values', () => {
      const result = processVrboRevenue(reservationId, businessModel, {
        taxes: [
          { id: 'clk04vdkx000ot222kvdt04v1-state', name: 'taxName', value: 10 },
        ],
        fees: [
          {
            id: 'cllbpup6m0005uwrodz6mxzt2',
            name: 'feeNameFromBp',
            value: 110,
          },
          {
            id: 'cllbph1uo003iuwdc0pinj750',
            name: 'feeNameFromBp2',
            value: 50,
          },
        ],
        commission: 66,
        accommodationRevenue: 200,
      })

      expect(result.reservationId).toEqual('some-reservation-id')
      expect(result.accommodationRevenue).toEqual(200)
      expect(result.channelCommission).toEqual(66)
      expect(result.fees.length).toEqual(2)

      // Fees found in the business model use those values
      expect(result.fees[0].value).toEqual(110)
      expect(result.fees[0].name).toEqual('feeNameFromVesta')
      expect(result.fees[0].unit).toEqual('fixed')
      expect(result.fees[0].pmcShare).toEqual(33)
      expect(result.fees[0].taxable).toEqual(true)
      expect(result.fees[0].taxes.length).toEqual(3)

      const sortedTaxes = result.fees[0].taxes.sort((a, b) =>
        a.description.localeCompare(b.description)
      )
      expect(sortedTaxes[0].value).toBeCloseTo(3) // County
      expect(sortedTaxes[1].value).toBeCloseTo(2) // Municipal
      expect(sortedTaxes[2].value).toBeCloseTo(5) // State

      // Fees not found in the business model are copied over with defaults
      expect(result.fees[1].value).toEqual(50)
      expect(result.fees[1].name).toEqual('feeNameFromBp2')
      expect(result.fees[1].unit).toEqual('')
      expect(result.fees[1].taxable).toEqual(false)
      expect(result.fees[1].pmcShare).toEqual(0)

      expect(result.taxes.length).toEqual(1)
      expect(result.taxes[0].value).toEqual(10)
      expect(result.taxes[0].description).toEqual('taxName')
    })
  })
})
