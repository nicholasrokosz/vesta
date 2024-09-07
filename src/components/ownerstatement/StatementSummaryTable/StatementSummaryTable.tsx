import { Stack, Table, Text, Title, createStyles } from '@mantine/core'
import { DateTime } from 'luxon'
import type { IOwnerStatement } from 'types/ownerstatement'
import { formatCurrency } from 'utils/formatCurrency'

const useStyles = createStyles((theme) => ({
  th: {
    border: 'none !important',
  },
  header: {
    backgroundColor: theme.colors.gray[1],
  },
  total: {
    fontWeight: 600,
  },
  subTotal: {
    fontWeight: 600,
    borderTop: `5px solid ${theme.colors.gray[4]}`,
  },
  dueToOwner: {
    backgroundColor: '#F3ECFE',
    fontWeight: 600,
    borderTop: '1px solid',
    borderColor: theme.colors.gray[6],
  },
  currency: {
    textAlign: 'right',
    paddingRight: 8,
  },
}))

interface Props {
  statement: IOwnerStatement
}

const StatementSummaryTable = ({ statement }: Props) => {
  const { classes, cx } = useStyles()

  const fromDate = DateTime.fromObject({
    month: statement.month,
    year: statement.year,
  })
  const activityLabel = `Activity from ${fromDate.toFormat(
    'MM/dd/yyyy'
  )} to ${fromDate.endOf('month').toFormat('MM/dd/yyyy')}`

  const COLUMNS = [
    {
      label: activityLabel,
      key: 'activity',
      format: 'string',
    },
    { label: 'Period', key: 'period', format: 'currency' },
  ]

  return (
    <Stack>
      <Title order={1}>Summary</Title>
      {statement.isCoHost ? (
        <Table highlightOnHover>
          <tbody>
            <tr>
              <td className={classes.total}>
                Gross revenue (sent to your bank account)
              </td>
              <td className={cx(classes.total, classes.currency)}>
                {formatCurrency(statement.grossRevenue || 0)}
              </td>
            </tr>
            <tr>
              <td>Less: Discounts</td>
              <td className={classes.currency}>
                ({formatCurrency(statement.discounts || 0)})
              </td>
            </tr>
            <tr>
              <td>Less: Taxes</td>
              <td className={classes.currency}>
                ({formatCurrency(statement.taxes || 0)})
              </td>
            </tr>
            {statement.channelFeesOther > 0 && (
              <tr>
                <td>Less: Channel fees (VRBO and other channels)</td>
                <td className={classes.currency}>
                  ({formatCurrency(statement.channelFeesOther || 0)})
                </td>
              </tr>
            )}
            <tr className={classes.subTotal}>
              <td>Net revenue</td>
              <td className={cx(classes.total, classes.currency)}>
                {formatCurrency(statement.netRevenue || 0)}
              </td>
            </tr>
            <tr>
              <td>Less: PM commission on room rate</td>
              <td className={classes.currency}>
                (
                {formatCurrency(
                  statement.accommodationRevenue.netRevenue.amount || 0
                )}
                )
              </td>
            </tr>
            <tr>
              <td>Less: PM commission on guest fees</td>
              <td className={classes.currency}>
                (
                {formatCurrency(
                  statement.guestFeeRevenue.netRevenue.managerAmount || 0
                )}
                )
              </td>
            </tr>
            <tr>
              <td>Less: Expenses</td>
              <td className={classes.currency}>
                ({formatCurrency(statement.expenses.costToOwnerPeriod || 0)})
              </td>
            </tr>
            <tr className={classes.subTotal}>
              <td>Property owner net proceeds</td>
              <td className={cx(classes.total, classes.currency)}>
                {formatCurrency(statement.dueToOwnerPeriod)}
              </td>
            </tr>
            <tr className={classes.dueToOwner}>
              <td className={classes.total}>Due to property manager</td>
              <td className={cx(classes.total, classes.currency)}>
                {formatCurrency(statement.dueToManagerPeriod)}
              </td>
            </tr>
          </tbody>
        </Table>
      ) : (
        <Table highlightOnHover striped>
          <thead className={classes.header}>
            <tr>
              {COLUMNS.map((column) => (
                <th className={classes.th} key={column.key}>
                  <Text align={column.format == 'currency' ? 'right' : 'left'}>
                    {column.label}
                  </Text>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Owner portion of accommodation revenue</td>
              <td className={classes.currency}>
                {formatCurrency(
                  statement.accommodationRevenue?.ownerPeriod || 0
                )}
              </td>
            </tr>
            <tr>
              <td>Owner portion of guest fees</td>
              <td className={classes.currency}>
                {formatCurrency(
                  statement.guestFeeRevenue.netRevenue.ownerAmount || 0
                )}
              </td>
            </tr>
            <tr>
              <td>Less: Expenses</td>
              <td className={classes.currency}>
                ({formatCurrency(statement.expenses.costToOwnerPeriod || 0)})
              </td>
            </tr>
            <tr className={classes.dueToOwner}>
              <td>Due to Owner</td>
              <td className={classes.currency}>
                {formatCurrency(statement.dueToOwnerPeriod)}
              </td>
            </tr>
          </tbody>
        </Table>
      )}
    </Stack>
  )
}

export default StatementSummaryTable
