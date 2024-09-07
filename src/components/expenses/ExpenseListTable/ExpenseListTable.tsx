import {
  Button,
  Stack,
  Table,
  Text,
  createStyles,
  Pagination,
  Center,
  Group,
} from '@mantine/core'
import { v4 as uuidv4 } from 'uuid'
import type { IExpense } from 'types/expenses'
import { useEffect, useState } from 'react'
import { api } from 'utils/api'
import { showNotification } from '@mantine/notifications'
import ExpenseRow from '../ExpenseRow/ExpenseRow'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.colors.gray[1],
  },
  th: {
    border: 'none !important',
  },
}))

interface Props {
  columns: {
    label: string
    key: string
    format: string
  }[]
  expenses: IExpense[]
  numberOfPages: number
  activePage: number
  onChange: (value: string) => void
}

const ExpensesTable = ({
  columns,
  expenses,
  activePage,
  onChange,
  numberOfPages,
}: Props) => {
  const { classes } = useStyles()

  const [showDeleteLink, setShowDeleteLink] = useState(false)
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([])

  const deleteExpensesMutation = api.expenses.delete.useMutation()

  useEffect(() => {
    if (deleteExpensesMutation.isError) {
      showNotification({
        title: '',
        message:
          'An error occurred deleting the expenses, please try again later.',
        color: 'red',
      })
    }
  }, [deleteExpensesMutation.isError])

  useEffect(() => {
    if (deleteExpensesMutation.isSuccess) {
      showNotification({
        title: '',
        message: 'Expenses deleted.',
        color: 'teal',
      })
    }
  }, [deleteExpensesMutation.isSuccess])

  const onSelect = (checked: boolean, expenseId: string) => {
    if (checked) {
      setSelectedExpenses([...selectedExpenses, expenseId])
    } else {
      setSelectedExpenses(selectedExpenses.filter((id) => id !== expenseId))
    }
  }

  useEffect(() => {
    setShowDeleteLink(selectedExpenses.length > 0)
  }, [selectedExpenses])

  return (
    <div className="loading-spinner-container">
      <VestaSpinnerOverlay visible={deleteExpensesMutation.isLoading} />
      <Stack>
        <Button
          disabled={!showDeleteLink}
          w={250}
          onClick={() => {
            if (
              window.confirm('Are you sure you want to delete these expenses?')
            ) {
              deleteExpensesMutation.mutate({ ids: selectedExpenses })
              setSelectedExpenses([])
            }
          }}
        >
          Delete selected expenses
        </Button>
        <Table highlightOnHover striped>
          <thead className={classes.header}>
            <tr>
              <td></td>
              <td></td>
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
            {expenses.map((expense) => (
              <ExpenseRow
                key={uuidv4()}
                expense={expense}
                onSelect={onSelect}
                isSelected={selectedExpenses.includes(expense.id)}
              />
            ))}
          </tbody>
        </Table>
        <Center>
          <Pagination.Root
            value={activePage}
            onChange={(val) => onChange(val.toString())}
            total={numberOfPages}
          >
            <Group spacing={5} position="center">
              <Pagination.Previous />
              <Pagination.Items />
              <Pagination.Next disabled={activePage === numberOfPages} />
            </Group>
          </Pagination.Root>
        </Center>
      </Stack>
    </div>
  )
}

export default ExpensesTable
