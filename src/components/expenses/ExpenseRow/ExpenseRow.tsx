import { Checkbox, Group, ActionIcon, Text, createStyles } from '@mantine/core'
import { useToggle } from '@mantine/hooks'
import {
  IconChevronDown,
  IconChevronRight,
  IconFileInvoice,
} from '@tabler/icons-react'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import type { IExpense } from 'types/expenses'
import { formatCurrency } from 'utils/formatCurrency'
import vestaInvoiceUtil from 'utils/vestaInvoice'

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

interface ExpenseRowProps {
  expense: IExpense
  isSelected: boolean
  onSelect: (selected: boolean, expenseId: string) => void
}

const ExpenseRow = ({ expense, isSelected, onSelect }: ExpenseRowProps) => {
  const { classes, cx } = useStyles()
  const router = useRouter()

  const routeToExpense = () =>
    void router.push(`/financials/expenses/${expense.id}`)

  const [open, toggleOpen] = useToggle([false, true] as const)

  useEffect(() => {
    toggleOpen(isSelected)
  }, [isSelected])

  return (
    <>
      <tr>
        <td>
          <Checkbox
            key={expense.id}
            checked={isSelected}
            disabled={expense.ownerStatementLocked}
            onChange={(event) => {
              onSelect(event.currentTarget.checked, expense.id)
            }}
          />
        </td>
        <td>
          {expense.listingExpenses.length > 1 ? (
            <Group>
              <ActionIcon onClick={() => toggleOpen()}>
                {open && <IconChevronDown size="1.125rem" />}
                {!open && <IconChevronRight size="1.125rem" />}
              </ActionIcon>
            </Group>
          ) : (
            <Group></Group>
          )}
        </td>
        <td onClick={routeToExpense} className={classes.row}>
          <Text>{expense.listingName}</Text>
        </td>
        <td onClick={routeToExpense} className={classes.row}>
          <Text>
            {DateTime.fromJSDate(expense.date).toFormat('MM/dd/yyyy')}
          </Text>
        </td>
        <td onClick={routeToExpense} className={classes.row}>
          <Text>{expense.vendor}</Text>
        </td>
        <td onClick={routeToExpense} className={classes.row}>
          <Text>{expense.ownerName}</Text>
        </td>
        <td onClick={routeToExpense} className={classes.row}>
          <Text>{expense.description}</Text>
        </td>
        <td
          className={cx(classes.currency, classes.row)}
          onClick={routeToExpense}
        >
          <Text>{formatCurrency(expense.amount)}</Text>
        </td>
        <td
          className={cx(classes.currency, classes.row)}
          onClick={routeToExpense}
        >
          <Text>{formatCurrency(expense.ownerPaidAmount)}</Text>
        </td>
        <td
          className={cx(classes.currency, classes.row)}
          onClick={routeToExpense}
        >
          <Text>{formatCurrency(expense.ownerChargedAmount)}</Text>
        </td>
        <td className={cx(classes.icon, classes.row)}>
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
        <td className={cx(classes.icon, classes.row)}>
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

      {open &&
        expense.listingExpenses.length > 1 &&
        expense.listingExpenses.map((le, i) => (
          <tr key={i} className={classes.child}>
            <td>
              <Checkbox disabled checked={isSelected} />
            </td>
            <td></td>
            <td onClick={routeToExpense} className={classes.row}>
              <Text>{le.listingName}</Text>
            </td>
            <td onClick={routeToExpense} className={classes.row}>
              <Text>
                {DateTime.fromJSDate(expense.date).toFormat('MM/dd/yyyy')}
              </Text>
            </td>
            <td onClick={routeToExpense} className={classes.row}>
              {expense.vendor}
            </td>
            <td onClick={routeToExpense} className={classes.row}>
              <Text>{le.ownerName}</Text>
            </td>
            <td onClick={routeToExpense} className={classes.row}>
              <Text>{expense.description}</Text>
            </td>
            <td
              className={cx(classes.currency, classes.row)}
              onClick={routeToExpense}
            >
              <Text>{formatCurrency(le.ownerChargedAmount)}</Text>
            </td>
            <td
              className={cx(classes.currency, classes.row)}
              onClick={routeToExpense}
            >
              <Text>{formatCurrency(le.ownerPaidAmount)}</Text>
            </td>
            <td
              className={cx(classes.currency, classes.row)}
              onClick={routeToExpense}
            >
              <Text>{formatCurrency(le.ownerChargedAmount)}</Text>
            </td>
            <td className={cx(classes.icon, classes.row)}></td>
            <td className={cx(classes.icon, classes.row)}></td>
          </tr>
        ))}
    </>
  )
}

export default ExpenseRow
