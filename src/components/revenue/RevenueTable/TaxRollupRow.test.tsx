import * as React from 'react'
import { render, screen } from 'utils/testing/RenderWithProviders'
import TaxRollupRow from './TaxRollupRow'

describe('TaxRollupRow', () => {
  it('displays the taxes when supplied, when we are adding taxes', () => {
    const taxes = [
      {
        description: 'Municipal tax',
        value: {
          amount: 18.4,
          managerAmount: 12.8,
          ownerAmount: 5.6,
          managerShare: 0.6956521739130436,
          ownerShare: 0.30434782608695654,
        },
      },
      {
        description: 'County tax',
        value: {
          amount: 9.2,
          managerAmount: 6.4,
          ownerAmount: 2.8,
          managerShare: 0.6956521739130436,
          ownerShare: 0.30434782608695654,
        },
      },
      {
        description: 'State tax',
        value: {
          amount: 23,
          managerAmount: 16,
          ownerAmount: 7,
          managerShare: 0.6956521739130436,
          ownerShare: 0.30434782608695654,
        },
      },
    ]

    render(<TaxRollupRow taxes={taxes} plusOrLess={'plus'} />)
    const plusTaxes = screen.getByText('Plus: Taxes')
    expect(plusTaxes).toBeInTheDocument()
  })

  it('displays the taxes when we are subtracting taxes', () => {
    const taxes = [
      {
        description: 'Municipal tax',
        value: {
          amount: 18.4,
          managerAmount: 12.8,
          ownerAmount: 5.6,
          managerShare: 0.6956521739130436,
          ownerShare: 0.30434782608695654,
        },
      },
      {
        description: 'County tax',
        value: {
          amount: 9.2,
          managerAmount: 6.4,
          ownerAmount: 2.8,
          managerShare: 0.6956521739130436,
          ownerShare: 0.30434782608695654,
        },
      },
      {
        description: 'State tax',
        value: {
          amount: 23,
          managerAmount: 16,
          ownerAmount: 7,
          managerShare: 0.6956521739130436,
          ownerShare: 0.30434782608695654,
        },
      },
    ]

    render(<TaxRollupRow taxes={taxes} plusOrLess={'less'} />)
    const plusTaxes = screen.getByText('Less: Taxes')
    expect(plusTaxes).toBeInTheDocument()
  })

  // it('toggling the rollup row expands the list of taxes', () => {
  //   //TODO: Implement this test
  // })

  // it('percentages are shown, () => {
  //   //TODO: Implement this test
  // })

  it('hides the tax rollup when the total is 0', () => {
    const taxes = [
      {
        description: 'Municipal tax',
        value: {
          amount: 0,
          managerAmount: 0,
          ownerAmount: 0,
          managerShare: 0.6956521739130436,
          ownerShare: 0.30434782608695654,
        },
      },
      {
        description: 'County tax',
        value: {
          amount: 0,
          managerAmount: 0,
          ownerAmount: 0,
          managerShare: 0.6956521739130436,
          ownerShare: 0.30434782608695654,
        },
      },
      {
        description: 'State tax',
        value: {
          amount: 0,
          managerAmount: 0,
          ownerAmount: 0,
          managerShare: 0.6956521739130436,
          ownerShare: 0.30434782608695654,
        },
      },
    ]

    render(<TaxRollupRow taxes={taxes} plusOrLess={'plus'} />)
    const plusTaxes = screen.queryByText('Plus: Taxes')
    expect(plusTaxes).toBeNull()
  })

  it('hides the tax rollup when the taxes array is empty', () => {
    render(<TaxRollupRow taxes={[]} plusOrLess={'plus'} />)
    const plusTaxes = screen.queryByText('Plus: Taxes')
    expect(plusTaxes).toBeNull()
  })
})
