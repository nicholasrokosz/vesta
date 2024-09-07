import { Text, createStyles, Tooltip, ActionIcon, Group } from '@mantine/core'
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react'
import { DateTime } from 'luxon'
import React from 'react'
import type { IPlaidTransaction } from 'types/expenses'
import { formatCurrency } from 'utils/formatCurrency'

const useStyles = createStyles((theme) => ({
  currency: {
    textAlign: 'right',
    paddingRight: 8,
  },
  row: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  icon: {
    textAlign: 'center',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  link: {
    '&:hover': {
      cursor: 'pointer',
    },
    textDecoration: 'none',
    color: theme.colors.gray[8],
  },
  child: {
    color: theme.colors.gray[6],
  },
}))

interface TransactionImportRowProps {
  transaction: IPlaidTransaction
  onAccept: (transactionId: string) => void
  onDismiss: (transactionId: string) => void
  enableAccept?: boolean
  enableDismiss?: boolean
}

const TransactionImportRow = ({
  transaction,
  onAccept,
  onDismiss,
  enableAccept,
  enableDismiss,
}: TransactionImportRowProps) => {
  const { classes, cx } = useStyles()

  return (
    <>
      <tr>
        <td className={classes.row}>
          <Text>
            {DateTime.fromJSDate(transaction.date).toFormat('MM/dd/yyyy')}
          </Text>
        </td>
        <td className={classes.row}>
          <Text>{transaction.vendor}</Text>
        </td>
        <td className={classes.row}>
          <Text>{transaction.account.name}</Text>
        </td>
        <td className={cx(classes.currency, classes.row)}>
          <Text>{formatCurrency(transaction.amount)}</Text>
        </td>
        <td className={classes.row}>
          <Group position={'right'}>
            {enableAccept && (
              <Tooltip label="Accept this transaction">
                <ActionIcon
                  onClick={() => onAccept(transaction.id)}
                  aria-label="Dismiss"
                >
                  <IconCircleCheck color="green" />
                </ActionIcon>
              </Tooltip>
            )}
            {enableDismiss && (
              <Tooltip label="Dismiss this transaction">
                <ActionIcon
                  onClick={() => onDismiss(transaction.id)}
                  aria-label="Dismiss"
                >
                  <IconCircleX color="red" />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </td>
      </tr>
    </>
  )
}

export default TransactionImportRow
