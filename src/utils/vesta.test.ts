import type { IAddress } from 'types'
import { formatAddress } from './vesta'

describe('formatAddress', () => {
  it('should generate a single line address without line2', () => {
    const addressable: IAddress = {
      line1: '123 Main St',
      line2: '',
      city: 'Springfield',
      state: 'IL',
      zip: '62704',
      country: 'US',
    }

    const expectedResult = '123 Main St, Springfield, IL 62704'
    expect(formatAddress(addressable)).toEqual(expectedResult)
  })

  it('should generate a single line address with line2', () => {
    const addressable: IAddress = {
      line1: '123 Main St',
      line2: 'Apt 4B',
      city: 'Springfield',
      state: 'IL',
      zip: '62704',
      country: 'US',
    }

    const expectedResult = '123 Main St, Apt 4B, Springfield, IL 62704'
    expect(formatAddress(addressable)).toEqual(expectedResult)
  })

  it('should generate a single line address when line2 is null', () => {
    const addressable: IAddress = {
      line1: '123 Main St',
      line2: null,
      city: 'Springfield',
      state: 'IL',
      zip: '62704',
      country: 'US',
    }

    const expectedResult = '123 Main St, Springfield, IL 62704'
    expect(formatAddress(addressable)).toEqual(expectedResult)
  })

  it('should add the country if not US', () => {
    const addressable: IAddress = {
      line1: '290 Bremner Blvd',
      line2: null,
      city: 'Toronto',
      state: 'ON',
      zip: 'M5V 3L9',
      country: 'CA',
    }

    const expectedResult = '290 Bremner Blvd, Toronto, ON M5V 3L9, CA'
    expect(formatAddress(addressable)).toEqual(expectedResult)
  })

  it('should skip state if empty', () => {
    const addressable: IAddress = {
      line1: 'Race course',
      line2: null,
      city: 'Oracabessa',
      state: '',
      zip: '',
      country: 'JA',
    }

    const expectedResult = 'Race course, Oracabessa, JA'
    expect(formatAddress(addressable)).toEqual(expectedResult)
  })
})
