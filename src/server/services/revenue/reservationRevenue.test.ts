import { FeeType, FeeUnit } from 'types'
import { getTaxes, getGuestFees, feeIsApplicaable } from './reservationRevenue'

describe('Reservation Revenue', () => {
  const taxRates = {
    municipal: 7.25,
    county: 0,
    state: 1.5,
  }

  describe('getTaxes', () => {
    it('gets the correct taxes', () => {
      const result = getTaxes(5000, 30, taxRates)

      expect(result.taxes[0].text).toEqual('Municipal tax')
      expect(result.taxes[0].total).toEqual(362.5)
      expect(result.taxes[0].manager).toEqual(108.75)
      expect(result.taxes[0].owner).toBeCloseTo(253.75)
    })

    it('gets the correct taxes when the tax rate is 0', () => {
      const result = getTaxes(5000, 30, { municipal: 0, county: 0, state: 0 })

      expect(result.taxes[0].text).toEqual('Municipal tax')
      expect(result.taxes[0].total).toEqual(0)
      expect(result.taxes[0].manager).toEqual(0)
      expect(result.taxes[0].owner).toEqual(0)
    })
  })

  describe('getGuestFees', () => {
    it('gets the correct values', () => {
      const fees = [
        {
          id: 'clhp5kawl0008vz7xv5tucj3k',
          name: 'Cleaning fee',
          value: 120,
          unit: 'PerStay',
          taxable: true,
          type: 'CleaningFee',
          pmcShare: 100,
        },
        {
          id: 'clhp5kawl0009vz7xagy49fhs',
          name: 'Pet fee',
          value: 60,
          unit: 'PerStay',
          taxable: false,
          type: 'PetFee',
          pmcShare: 60,
        },
        {
          id: 'clhp5kawl000avz7xqtl9j3d1',
          name: 'Internet',
          value: 40,
          unit: 'PerStay',
          taxable: true,
          type: 'General',
          pmcShare: 80,
        },
      ]

      const result = getGuestFees(fees, 4, 3, 4, taxRates, true)
      const first = result.fees[0]

      expect(first.value).toEqual(120)
      expect(first.pmcShare).toEqual(100)
      expect(first.taxes.length).toEqual(3)

      const second = result.fees[1]
      expect(second.taxes.length).toEqual(0)
    })
  })

  it('gets the correct values when there are no fees', () => {
    const results = getGuestFees([], 4, 3, 4, taxRates, true)

    expect(results.fees).toEqual([])
  })

  it('gets the correct values when there is no share entered', () => {
    const fees = [
      {
        id: 'clhp5kawl0008vz7xv5tucj3k',
        name: 'Cleaning fee',
        value: 120,
        unit: 'PerStay',
        taxable: true,
        type: 'CleaningFee',
        pmcShare: 0,
      },
    ]
    const result = getGuestFees(fees, 4, 3, 4, taxRates, true)
    const first = result.fees[0]

    expect(first.value).toEqual(120)
    expect(first.taxes.length).toEqual(3)

    const sortedTaxes = first.taxes.sort((a, b) =>
      a.description.localeCompare(b.description)
    )
    expect(sortedTaxes[0].value).toEqual(0) // County
    expect(sortedTaxes[1].value).toEqual(8.7) // Municipal
    expect(sortedTaxes[2].value).toBeCloseTo(1.8) // State
  })

  describe('feeIsApplicable', () => {
    it('CLeaningFee: it returns true when the type is CleaningFee', () => {
      const fee = {
        id: 'clhp5kawl0009vz7xagy49fhs',
        name: 'Cleaning fee',
        share: 60,
        taxable: false,
        type: FeeType.CleaningFee,
        unit: FeeUnit.PerStay,
        value: 60,
      }
      const result = feeIsApplicaable(fee, 3, 5, false)
      expect(result).toEqual(true)
    })

    it('CleaningFee - Pet fee: returns false when pet condition is not met', () => {
      const fee = {
        id: 'clhp5kawl0009vz7xagy49fhs',
        name: 'Pet fee',
        share: 60,
        taxable: false,
        type: FeeType.CleaningFee,
        unit: FeeUnit.PerStay,
        value: 60,
      }

      const result = feeIsApplicaable(fee, 3, 5, false)
      expect(result).toEqual(false)
    })

    it('PerDayPerPersonExtra: returns true when max guests is exceeded', () => {
      const fee = {
        id: 'clhp5kawl0009vz7xagy49fhs',
        name: 'Extra guest',
        share: 60,
        taxable: false,
        type: FeeType.General,
        unit: FeeUnit.PerDayPerPersonExtra,
        value: 60,
      }

      const result = feeIsApplicaable(fee, 7, 4, false)
      expect(result).toEqual(true)
    })

    it('PerDayPerPersonExtra: returns false when max guests is not exceeded', () => {
      const fee = {
        id: 'clhp5kawl0009vz7xagy49fhs',
        name: 'Extra guest',
        share: 60,
        taxable: false,
        type: FeeType.General,
        unit: FeeUnit.PerDayPerPersonExtra,
        value: 60,
      }

      const result = feeIsApplicaable(fee, 1, 4, false)
      expect(result).toEqual(false)
    })
  })
})
