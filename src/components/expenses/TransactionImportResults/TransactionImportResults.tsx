import { Center, Group, Pagination, Space, Tabs } from '@mantine/core'
import TransactionImportTable from '../TransactionImportTable/TransactionImportTable'
import { api } from 'utils/api'
import type { IPlaidTransaction } from 'types/expenses'
import { useEffect } from 'react'
import { showNotification } from '@mantine/notifications'
import { useRouter } from 'next/router'

interface Props {
  transactions: IPlaidTransaction[]
  activeTab: string
  activePage: number
  numberOfPages: number
  onUpdateTransaction: () => void
  onTabChange: (tab: string) => void
  onPageChange: (value: string) => void
}

const TransactionImportResults = ({
  transactions,
  activeTab,
  activePage,
  numberOfPages,
  onUpdateTransaction,
  onTabChange,
  onPageChange,
}: Props) => {
  const router = useRouter()
  const updateTransactionMutation = api.plaid.updateTransaction.useMutation()

  useEffect(() => {
    if (updateTransactionMutation.isSuccess) {
      showNotification({
        title: '',
        message: 'Expense dismissed!',
        color: 'teal',
      })
      onUpdateTransaction()
    }
  }, [updateTransactionMutation.isSuccess])

  const onAccept = (transactionId: string) => {
    void router.push(`/financials/expenses/import/${transactionId}`)
  }

  const onDismiss = (transactionId: string) => {
    updateTransactionMutation.mutate({
      id: transactionId,
      status: 'DISMISSED',
    })
  }

  return (
    <div className="loading-spinner-container">
      <Tabs defaultValue={activeTab} onTabChange={onTabChange}>
        <Tabs.List>
          <Tabs.Tab value="PENDING" fz="md">
            Unreviewed
          </Tabs.Tab>
          <Tabs.Tab value="ACCEPTED" fz="md">
            Accepted
          </Tabs.Tab>
          <Tabs.Tab value="DISMISSED" fz="md">
            Dismissed
          </Tabs.Tab>
        </Tabs.List>
        <Space h="lg" />
        <Tabs.Panel value="PENDING">
          <TransactionImportTable
            onAccept={onAccept}
            onDismiss={onDismiss}
            transactions={transactions}
            enableAccept={true}
            enableDismiss={true}
          />
        </Tabs.Panel>
        <Tabs.Panel value="ACCEPTED">
          <TransactionImportTable
            onAccept={onAccept}
            onDismiss={onDismiss}
            transactions={transactions}
            enableAccept={false}
            enableDismiss={false}
          />
        </Tabs.Panel>
        <Tabs.Panel value="DISMISSED">
          <TransactionImportTable
            onAccept={onAccept}
            onDismiss={onDismiss}
            transactions={transactions}
            enableAccept={true}
            enableDismiss={false}
          />
        </Tabs.Panel>
      </Tabs>
      {transactions && transactions.length > 0 && (
        <Center>
          <Pagination.Root
            value={activePage}
            onChange={(val) => onPageChange(val.toString())}
            total={numberOfPages}
          >
            <Group spacing={5} position="center">
              <Pagination.Previous />
              <Pagination.Items />
              <Pagination.Next disabled={activePage === numberOfPages} />
            </Group>
          </Pagination.Root>
        </Center>
      )}
    </div>
  )
}

export default TransactionImportResults
