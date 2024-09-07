import { type NextPage } from 'next'
import { Space, Text, Stack, Button, Group, Select } from '@mantine/core'
import { api } from 'utils/api'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'
import { useEffect, useState } from 'react'
import React from 'react'
import TransactionImportResults from 'components/expenses/TransactionImportResults/TransactionImportResults'
import { getLongDateTime } from 'utils/dateFormats'
import { IconBuildingBank } from '@tabler/icons-react'
import PlaidLink from 'components/plaid/link/PlaidLink'

const Import: NextPage = () => {
  const [selectedAccount, setSelectedAccount] = useState<string>()
  const [accountsList, setAccountsList] = useState<
    { label: string; value: string }[]
  >([])
  const [selectedStatus, setSelectedStatus] = useState<string>('PENDING')
  const [activePage, setActivePage] = useState(1)
  const [numPages, setNumPages] = useState(1)

  const plaidItemMutation = api.plaid.saveItem.useMutation()
  const transactions = api.plaid.getCreditCardTransactions.useQuery({
    status: selectedStatus,
    page: activePage,
    accountId: selectedAccount,
  })
  const syncTransactionsMutation = api.plaid.syncTransactions.useMutation()

  const updatedAt = transactions.data?.updatedAt ?? new Date()

  const calculateNumberOfPages = () =>
    transactions.data?.totalNumberOfTransactions
      ? Math.ceil(transactions.data.totalNumberOfTransactions / 20)
      : 0

  useEffect(() => {
    if (transactions.data?.accounts == null || accountsList.length > 1) return
    const accounts: { value: string; label: string }[] = [
      {
        value: '',
        label: 'All accounts',
      },
    ]
    transactions.data?.accounts.map((account) =>
      accounts.push({
        value: account.id,
        label: account.name,
      })
    )
    setAccountsList(accounts)
  }, [transactions.data?.accounts])

  useEffect(() => {
    if (plaidItemMutation.isSuccess) {
      void syncTransactionsMutation.mutate()
    }
  }, [plaidItemMutation.isSuccess])

  useEffect(() => {
    if (syncTransactionsMutation.isSuccess) {
      void transactions.refetch()
    }
  }, [syncTransactionsMutation.isSuccess])

  const handleFilterChange = (
    param: 'status' | 'accountId' | 'page',
    value: string | string[] | null
  ) => {
    if (param === 'accountId') {
      setSelectedAccount(value as string)
    } else if (param === 'status') {
      setSelectedStatus(value === null ? 'PENDING' : (value as string))
    } else if (param === 'page') {
      setActivePage(+(value as string))
    }
  }

  useEffect(() => {
    if (transactions.data) {
      setNumPages(calculateNumberOfPages())
      if (transactions.data.pageTooHigh) handleFilterChange('page', '1')
    }
  }, [transactions.data])

  return (
    <>
      <Breadcrumbs links={[{ title: 'Import expenses' }]} />
      <Space h="xl" />
      <VestaSpinnerOverlay
        visible={
          transactions.isLoading ||
          plaidItemMutation.isLoading ||
          syncTransactionsMutation.isLoading
        }
      />
      {accountsList.length > 1 ? (
        <Stack>
          <Group position="apart">
            <Select
              w={300}
              defaultValue={''}
              label="Select account"
              placeholder="Select an account to filter results"
              searchable
              data={accountsList}
              value={selectedAccount}
              onChange={(value) => void handleFilterChange('accountId', value)}
              icon={<IconBuildingBank size="1.25rem" />}
            />
            <Stack>
              <Button onClick={() => void syncTransactionsMutation.mutate()}>
                Get latest from from Plaid
              </Button>
              <Text fs={'italic'}>
                Last import: {getLongDateTime(updatedAt)}
              </Text>
            </Stack>
          </Group>

          <TransactionImportResults
            transactions={transactions.data?.transactions || []}
            activeTab={selectedStatus}
            onUpdateTransaction={() => void transactions.refetch()}
            onTabChange={(tab) => void handleFilterChange('status', tab)}
            activePage={activePage}
            onPageChange={(val) => void handleFilterChange('page', val)}
            numberOfPages={numPages}
          />
        </Stack>
      ) : (
        <Stack>
          <Text>No accounts found to import from.</Text>
          <Group>
            <PlaidLink onSuccess={plaidItemMutation.mutate} />
          </Group>
        </Stack>
      )}
    </>
  )
}

export default Import
