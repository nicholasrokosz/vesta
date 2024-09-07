import { type NextPage } from 'next'
import {
  Center,
  Title,
  Stack,
  Space,
  Flex,
  Button,
  Group,
  Select,
  Image,
} from '@mantine/core'
import { api } from 'utils/api'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import ExpensesTable from 'components/expenses/ExpenseListTable/ExpenseListTable'
import { CSVLink } from 'react-csv'
import { IconCalendarTime, IconPlus } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'
import type { IExpense, MonthFilter, ExpensesUrlParams } from 'types/expenses'
import { useRouter } from 'next/router'
import SelectListing from 'components/listings/SelectListing/Single'
import { useUrlParams } from 'hooks/useUrlParams'

const Expenses: NextPage = () => {
  const router = useRouter()
  const { params, upsertParams, removeParams, isActive } =
    useUrlParams<ExpensesUrlParams>()

  const [expenses, setExpenses] = useState<IExpense[]>([])
  const [selectedMonthFilter, setSelectedMonthFilter] =
    useState<MonthFilter>('')
  const [selectedListing, setSelectedListing] = useState<string>('')
  const [activePage, setActivePage] = useState(1)
  const [numPages, setNumPages] = useState(1)

  const { data, isLoading } = api.expenses.getPage.useQuery(
    {
      page: activePage,
      listingId: selectedListing,
      month: selectedMonthFilter,
    },
    { enabled: !!router.query }
  )

  useEffect(() => {
    if (data) {
      setExpenses(data.expenses)
      setNumPages(calculateNumberOfPages())
      if (data.pageTooHigh) handleFilterChange('page', '1')
    }
  }, [data])

  useEffect(() => {
    if (isActive('page')) setActivePage(+params.page)
    if (isActive('listing')) setSelectedListing(params.listing)
    if (isActive('month')) setSelectedMonthFilter(params.month as MonthFilter)
  }, [params])

  const COLUMNS = [
    { label: 'Property', key: 'listingName', format: 'string' },
    { label: 'Date', key: 'date', format: 'date' },
    { label: 'Vendor', key: 'vendor', format: 'string' },
    { label: 'Owner', key: 'ownerName', format: 'string' },
    { label: 'Description', key: 'description', format: 'string' },
    { label: 'Amount', key: 'amount', format: 'currency' },
    { label: 'Owner paid', key: 'ownerPaidAmount', format: 'currency' },
    {
      label: 'Charged to owner',
      key: 'ownerChargedAmount',
      format: 'currency',
    },
    {
      label: 'Invoice',
      key: 'invice',
      format: 'currency',
    },
    {
      label: 'Receipt',
      key: 'receipt',
      format: 'currency',
    },
  ]

  const getFileName = () => {
    const date = DateTime.fromJSDate(new Date()).toFormat('MM-yyyy')
    return `expenses-${date}.csv` // TODO format date
  }

  const calculateNumberOfPages = () =>
    data ? Math.ceil(data.totalNumberOfExpenses / 20) : 0

  const handleFilterChange = (param: ExpensesUrlParams, value: string) => {
    if (param === 'listing') setSelectedListing(value)
    else if (param === 'month')
      setSelectedMonthFilter(value === null ? '' : (value as MonthFilter))
    else setActivePage(+value)

    if (value === '' || value === '1') {
      removeParams([param])
    } else {
      upsertParams({ [param]: value })
    }
  }

  return (
    <>
      <Flex justify="space-between">
        <Title order={1}>Expenses</Title>
        <Group>
          {expenses && (
            <CSVLink headers={COLUMNS} data={expenses} filename={getFileName()}>
              <Button variant="subtle" leftIcon={<IconPlus />}>
                Export to CSV
              </Button>
            </CSVLink>
          )}
          <Button onClick={() => void router.push(`/financials/expenses/new`)}>
            Add Expense
          </Button>

          <Button
            bg={'black'}
            onClick={() => void router.push(`/financials/expenses/import`)}
          >
            Import from <Image ml="xs" src={'/plaid-logo.svg'} alt="Plaid" />
          </Button>
        </Group>
      </Flex>
      <Space h="xl" />
      <Group>
        <Select
          size={'sm'}
          data={[
            { label: 'All', value: '' },
            {
              label: 'Last month',
              value: 'last',
            },
            { label: 'Current month', value: 'current' },
            {
              label: 'Next month',
              value: 'next',
            },
          ]}
          value={selectedMonthFilter}
          icon={<IconCalendarTime size="1.25rem" />}
          onChange={(val) => void handleFilterChange('month', val ?? '')}
        />
        <SelectListing
          excludeIds={[]}
          onSelect={(val) => void handleFilterChange('listing', val)}
          selectedId={selectedListing}
          displayLabel={false}
          placeholder={'All listings'}
          allOption={true}
        />
      </Group>
      <Space h="md" />
      <VestaSpinnerOverlay visible={isLoading} />
      {!isLoading && (
        <>
          {expenses && expenses.length ? (
            <ExpensesTable
              expenses={expenses}
              columns={COLUMNS}
              activePage={activePage}
              onChange={(val) => void handleFilterChange('page', val)}
              numberOfPages={numPages}
            />
          ) : (
            <Center pt={100}>
              <Stack align={'center'} w={600}>
                <>
                  <Title order={2}>
                    You do not have any expenses that match the selected
                    filters.
                  </Title>
                </>
              </Stack>
            </Center>
          )}
        </>
      )}
    </>
  )
}

export default Expenses
