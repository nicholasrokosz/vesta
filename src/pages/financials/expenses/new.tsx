import { useEffect } from 'react'
import { type NextPage } from 'next'
import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'
import { api } from 'utils/api'
import { useRouter } from 'next/router'
import NewExpense from 'components/expenses/new'
import { showNotification } from '@mantine/notifications'
import type { ExpenseCreate } from 'types/expenses'

const New: NextPage = () => {
  const router = useRouter()
  const mutation = api.expenses.create.useMutation()

  useEffect(() => {
    if (mutation.isSuccess) {
      showNotification({
        title: '',
        message: 'Expense created!',
        color: 'teal',
      })
      void router.push('/financials/expenses')
    }
  }, [mutation])

  return (
    <>
      <Breadcrumbs
        links={[
          { title: 'Expenses', href: '/financials/expenses' },
          { title: 'New Expense' },
        ]}
      />
      <NewExpense
        onSubmit={(expense: ExpenseCreate) => {
          mutation.mutate(expense)
        }}
      />
    </>
  )
}

export default New
