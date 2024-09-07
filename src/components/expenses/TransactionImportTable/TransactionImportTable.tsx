import { Stack, Table, Text, Center, createStyles } from '@mantine/core'
import { v4 as uuidv4 } from 'uuid'

import TransactionImportRow from '../TransactionImportRow/TransactionImportRow'
import type { IPlaidTransaction } from 'types/expenses'

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.colors.gray[1],
  },
  th: {
    border: 'none !important',
  },
}))

interface Props {
  transactions: IPlaidTransaction[]
  onAccept: (expenseId: string) => void
  onDismiss: (expenseId: string) => void
  enableAccept?: boolean
  enableDismiss?: boolean
}

const TransactionImportTable = ({
  transactions,
  onDismiss,
  onAccept,
  enableAccept,
  enableDismiss,
}: Props) => {
  const { classes } = useStyles()

  const columns = [
    {
      label: 'Date',
      key: 'date',
      format: 'date',
    },
    {
      label: 'Vendor',
      key: 'vendor',
      format: 'text',
    },
    {
      label: 'Account',
      key: 'account',
      format: 'text',
    },
    {
      label: 'Amount',
      key: 'amount',
      format: 'currency',
    },
    {
      label: '',
      key: 'actions',
      format: 'text',
    },
  ]

  return (
    <Stack>
      <Table highlightOnHover striped>
        <thead className={classes.header}>
          <tr>
            {columns.map((column) => (
              <th className={classes.th} key={column.key}>
                <Text align={column.format == 'currency' ? 'right' : 'left'}>
                  {column.label}
                </Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <TransactionImportRow
              key={uuidv4()}
              transaction={transaction}
              onAccept={onAccept}
              onDismiss={onDismiss}
              enableAccept={enableAccept}
              enableDismiss={enableDismiss}
            />
          ))}
        </tbody>
      </Table>

      {transactions.length === 0 && <Center>Nothing so far!</Center>}
    </Stack>
  )
}

export default TransactionImportTable
