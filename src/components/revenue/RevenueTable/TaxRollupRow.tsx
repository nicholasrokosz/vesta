import { Box, Flex } from '@mantine/core'
import type { IRevenueTax } from 'types/revenue'
import { formatCurrency } from 'utils/formatCurrency'
import RevenueCell from './RevenueCell'
import RevenueRow from './RevenueRow'
import { RevenueCellFormat } from './types'
import { v4 as uuidv4 } from 'uuid'
import { useToggle } from '@mantine/hooks'
import type { ReactNode } from 'react'
import AmountWithShare from './AmountWithShare'
import RevenueActionCell from './RevenueActionCell'

interface Props {
  taxes: IRevenueTax[]
  plusOrLess: 'plus' | 'less'
  showPercentages?: boolean
}

const TaxRollupRow = ({
  taxes,
  plusOrLess,
  showPercentages = false,
}: Props) => {
  const [open, toggleOpen] = useToggle([false, true] as const)
  const totalTaxes = taxes.reduce((a, b) => a + b.value.amount, 0)
  const managerTaxes = taxes.reduce((a, b) => a + b.value.managerAmount, 0)
  const ownerTaxes = taxes.reduce((a, b) => a + b.value.ownerAmount, 0)

  const managerShare = totalTaxes > 0 ? managerTaxes / totalTaxes : 0
  const ownerShare = totalTaxes > 0 ? ownerTaxes / totalTaxes : 0

  if (totalTaxes === 0) return <></>
  return (
    <>
      <RevenueRow key={uuidv4()}>
        <RevenueActionCell
          label={(plusOrLess === 'plus' ? 'Plus' : 'Less') + ': Taxes'}
          open={open}
          toggleOpen={toggleOpen}
        />
        <RevenueCell format={RevenueCellFormat.Currency}>
          <CellValue plusOrLess={plusOrLess}>
            {formatCurrency(totalTaxes)}
          </CellValue>
        </RevenueCell>
        <RevenueCell format={RevenueCellFormat.Currency}>
          {showPercentages ? (
            <AmountWithShare
              amount={managerTaxes}
              share={managerShare}
              isDeduction={plusOrLess === 'less'}
            />
          ) : (
            <CellValue plusOrLess={plusOrLess}>
              {formatCurrency(managerTaxes)}
            </CellValue>
          )}
        </RevenueCell>
        <RevenueCell format={RevenueCellFormat.Currency}>
          {showPercentages ? (
            <AmountWithShare
              amount={ownerTaxes}
              share={ownerShare}
              isDeduction={plusOrLess === 'less'}
            />
          ) : (
            <CellValue plusOrLess={plusOrLess}>
              {formatCurrency(ownerTaxes)}
            </CellValue>
          )}
        </RevenueCell>
      </RevenueRow>
      {open &&
        taxes.map((tax) => (
          <RevenueRow key={uuidv4()}>
            <RevenueCell>
              <Flex>
                <Box w="xl"></Box>
                {tax.description}
              </Flex>
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <CellValue plusOrLess={plusOrLess}>
                {formatCurrency(tax.value.amount)}
              </CellValue>
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              {showPercentages ? (
                <AmountWithShare
                  amount={tax.value.managerAmount}
                  share={managerShare}
                  isDeduction={plusOrLess === 'less'}
                />
              ) : (
                <CellValue plusOrLess={plusOrLess}>
                  {formatCurrency(tax.value.managerAmount)}
                </CellValue>
              )}
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              {showPercentages ? (
                <AmountWithShare
                  amount={tax.value.ownerAmount}
                  share={ownerShare}
                  isDeduction={plusOrLess === 'less'}
                />
              ) : (
                <CellValue plusOrLess={plusOrLess}>
                  {formatCurrency(tax.value.ownerAmount)}
                </CellValue>
              )}
            </RevenueCell>
          </RevenueRow>
        ))}
    </>
  )
}

const CellValue = ({
  children,
  plusOrLess,
}: {
  children: ReactNode
  plusOrLess: 'plus' | 'less'
}) => (plusOrLess === 'plus' ? <>{children}</> : <>({children})</>)

export default TaxRollupRow
