import { useEffect, useState } from 'react'
import { type NextPage } from 'next'
import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'
import { api } from 'utils/api'
import { useRouter } from 'next/router'
import NewExpense from 'components/expenses/new'
import { showNotification } from '@mantine/notifications'
import type { ExpenseCreate } from 'types/expenses'
import { Alert, Box, Stack } from '@mantine/core'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import { IconAlertCircle } from '@tabler/icons-react'

const New: NextPage = () => {
  const router = useRouter()

  const { data: plaidTransaction, isLoading } =
    api.plaid.getTransaction.useQuery(
      {
        id: router.query.id as string,
      },
      { enabled: !!router.query.id }
    )
  const createExpenseMutation = api.expenses.create.useMutation()
  const [displayAlert, setDisplayAlert] = useState(true)

  useEffect(() => {
    if (createExpenseMutation.isSuccess) {
      showNotification({
        title: '',
        message: 'Expense created!',
        color: 'teal',
      })
      void router.back()
    }
  }, [createExpenseMutation.isSuccess])

  const onSubmit = (expense: ExpenseCreate) => {
    createExpenseMutation.mutate({
      ...expense,
      id: expense.id ?? '',
    })
  }

  return (
    <Box className="loading-spinner-container">
      {isLoading ? (
        <VestaSpinnerOverlay visible={true} />
      ) : (
        <>
          <Breadcrumbs
            links={[
              { title: 'Expenses', href: '/financials/expenses' },
              { title: 'Import expense' },
            ]}
          />
          {plaidTransaction ? (
            <Stack mt="md" spacing="xs">
              {displayAlert && (
                <Alert
                  icon={<IconAlertCircle size="1.5rem" />}
                  title="Select a listing"
                  color="violet"
                  radius="md"
                  withCloseButton
                  closeButtonLabel="Close alert"
                  onClose={() => setDisplayAlert(false)}
                >
                  Please select a listing to accept this expense.
                </Alert>
              )}

              <NewExpense
                onSubmit={onSubmit}
                expense={{
                  date: plaidTransaction.date,
                  vendor: plaidTransaction.vendor,
                  amount: plaidTransaction.amount,
                  listingExpenses: [
                    {
                      listingId: '',
                      amount: plaidTransaction.amount,
                      amountPaid: 0,
                      confirmationCode: '',
                    },
                  ],
                  plaidTransactionId: plaidTransaction.id,
                }}
                ownerStatementLocked={false}
              />
            </Stack>
          ) : (
            <>Cannot locate transaction</>
          )}
        </>
      )}
    </Box>
  )
}

export default New
