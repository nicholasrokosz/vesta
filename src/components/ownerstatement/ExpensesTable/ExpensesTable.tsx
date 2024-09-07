import { Title, Stack, Table, Text, createStyles } from '@mantine/core'
import { v4 as uuidv4 } from 'uuid'
import { formatCurrency } from 'utils/formatCurrency'
import type { IExpense } from 'types/expenses'
import type { IOwnerExpense } from 'types/ownerstatement'
import { IconFileInvoice } from '@tabler/icons-react'
import Link from 'next/link'
import vestaInvoiceUtil from 'utils/vestaInvoice'
import { DateTime } from 'luxon'

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.colors.gray[1],
  },
  th: {
    border: 'none !important',
  },
  currency: {
    textAlign: 'right',
    paddingRight: 8,
  },
  total: {
    backgroundColor: theme.colors.gray[1],
    fontWeight: 600,
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
    color: theme.colors.gray[7],
  },
}))

interface Props {
  expenses: IOwnerExpense
}

interface ExpenseRowProps {
  expense: IExpense
}

const ExpenseRow = ({ expense }: ExpenseRowProps) => {
  const { classes } = useStyles()

  return (
    <tr>
      <td>
        <Text>{DateTime.fromJSDate(expense.date).toFormat('MMM dd yyyy')}</Text>
      </td>
      <td>
        <Text>{expense.vendor}</Text>
      </td>
      <td>
        <Text>{expense.description}</Text>
      </td>
      <td className={classes.currency}>
        <Text>{formatCurrency(expense.ownerChargedAmount)}</Text>
      </td>
      <td className={classes.currency}>
        <Text>{formatCurrency(expense.ownerPaidAmount)}</Text>
      </td>
      <td className={classes.currency}>
        <Text>{formatCurrency(expense.ownerUnpaidAmount)}</Text>
      </td>
      <td className={classes.icon}>
        {expense.invoiceUrl ? (
          <Link
            target="_blank"
            href={vestaInvoiceUtil.getFile(expense.invoiceUrl)}
            className={classes.link}
          >
            <IconFileInvoice size={18} />
          </Link>
        ) : (
          <></>
        )}
      </td>
      <td className={classes.icon}>
        {expense.receiptUrl ? (
          <Link
            target="_blank"
            href={vestaInvoiceUtil.getFile(expense.receiptUrl)}
            className={classes.link}
          >
            <IconFileInvoice size={18} />
          </Link>
        ) : (
          <></>
        )}
      </td>
    </tr>
  )
}

const ExpensesTable = ({ expenses }: Props) => {
  const { classes } = useStyles()

  const COLUMNS = [
    { label: 'Date', key: 'date', format: 'string' },
    { label: 'Vendor', key: 'vendor', format: 'string' },
    { label: 'Description', key: 'description', format: 'string' },
    { label: 'Total', key: 'totalAmount', format: 'currency' },
    {
      label: 'Already reimbursed',
      key: 'reimbursedAmount',
      format: 'currency',
    },
    {
      label: 'Unpaid',
      key: 'unpaidAmount',
      format: 'currency',
    },
    { label: 'Invoice', key: 'invoice', format: 'icon' },
    { label: 'Receipt', key: 'receipt', format: 'icon' },
  ]
  return (
    <Stack>
      <Title order={1}>Expenses</Title>
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
          {expenses.items.map((expense) => (
            <ExpenseRow key={uuidv4()} expense={expense} />
          ))}
          <tr className={classes.total}>
            <td>Total</td>
            <td>-</td>
            <td>-</td>
            <td className={classes.currency}>
              {formatCurrency(expenses.totalAmount)}
            </td>
            <td className={classes.currency}>
              {formatCurrency(expenses.reimbursedAmount)}
            </td>
            <td className={classes.currency}>
              {formatCurrency(expenses.unpaidAmount)}
            </td>
            <td className={classes.icon}>-</td>
            <td className={classes.icon}>-</td>
          </tr>
        </tbody>
      </Table>
    </Stack>
  )
}

export default ExpensesTable
