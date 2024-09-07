import { useEffect } from 'react'
import { type NextPage } from 'next'
import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'
import { api } from 'utils/api'
import { useRouter } from 'next/router'
import NewExpense from 'components/expenses/new'
import { showNotification } from '@mantine/notifications'
import type { ExpenseCreate } from 'types/expenses'
import { Box } from '@mantine/core'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'

const Expense: NextPage = () => {
  const router = useRouter()
  const { data, refetch } = api.expenses.getOne.useQuery({
    id: router.query.id as string,
  })
  const mutation = api.expenses.update.useMutation()

  useEffect(() => {
    if (mutation.isSuccess) {
      showNotification({
        title: '',
        message: 'Expense updated!',
        color: 'teal',
      })
      void router.push('/financials/expenses')
      void refetch()
    }
  }, [mutation.isSuccess])

  useEffect(() => {
    if (mutation.isError) {
      showNotification({
        title: '',
        message: 'Something went wrong',
        color: 'red',
      })
      void router.push('/financials/expenses')
      void refetch()
    }
  }, [mutation.isError])

  return (
    <Box className="loading-spinner-container">
      {!data ? (
        <VestaSpinnerOverlay visible={true} />
      ) : (
        <>
          <Breadcrumbs
            links={[
              { title: 'Expenses', href: '/financials/expenses' },
              {
                title: data.expense.description || 'Edit expense',
              },
            ]}
          />
          <NewExpense
            onSubmit={(expense: ExpenseCreate) => {
              mutation.mutate({ ...expense, id: expense.id ?? '' })
            }}
            expense={data.expense}
            ownerStatementLocked={data.ownerStatementLocked}
          />
        </>
      )}
    </Box>
  )
}

export default Expense
