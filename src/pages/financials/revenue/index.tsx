import { type NextPage } from 'next'
import {
  Center,
  Title,
  Stack,
  Space,
  Flex,
  Group,
  Select,
  Button,
} from '@mantine/core'
import type { SelectItem } from '@mantine/core'
import { api } from 'utils/api'
import ReservationsTable from 'components/revenue/ReservationsTable/ReservationsTable'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import { IconCalendarTime } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import SelectListing from 'components/listings/SelectListing/Single'
import { CSVLink } from 'react-csv'
import { IconPlus } from '@tabler/icons-react'
import { DateTime } from 'luxon'
import { ReservationStatus } from 'types/reservation'
import { monthEqualsFilterMonth } from 'utils/dates'
import { COLUMNS, formatForCSV } from 'utils/revenueCsv'
import DateString from 'types/dateString'
import { useUrlParams } from 'hooks/useUrlParams'
import { useRouter } from 'next/router'

type ReservationRevenueUrlParams = 'month' | 'listing' | 'status' | 'owner'

const ReservationsPage: NextPage = () => {
  const router = useRouter()

  return <Reservations key={router.asPath} />
}

const Reservations = () => {
  const { params, upsertParams, removeParams, isActive } =
    useUrlParams<ReservationRevenueUrlParams>()

  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>(
    isActive('month') ? params.month : '0'
  )
  const [selectedListing, setSelectedListing] = useState<string>(
    isActive('listing') ? params.listing : ''
  )
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>(
    isActive('status') ? params.status : ''
  )
  const [selectedPropertyOwnerFilter, setSelectedPropertyOwnerFilter] =
    useState<string>(isActive('owner') ? params.owner : '')

  const { data, isLoading } = api.revenue.getAllReservationRevenue.useQuery({})
  const { data: ownersData } = api.organizations.getOwners.useQuery()

  const toBeRemoved: ReservationRevenueUrlParams[] = []
  const toBeUpdated: { [param: string]: string } = {}
  if (selectedMonthFilter === '0') toBeRemoved.push('month')
  else toBeUpdated.month = selectedMonthFilter
  if (selectedListing === '') toBeRemoved.push('listing')
  else toBeUpdated.listing = selectedListing
  if (selectedStatusFilter === '') toBeRemoved.push('status')
  else toBeUpdated.status = selectedStatusFilter
  if (selectedPropertyOwnerFilter === '') toBeRemoved.push('owner')
  else toBeUpdated.owner = selectedPropertyOwnerFilter

  useEffect(() => {
    removeParams(toBeRemoved)
    upsertParams(toBeUpdated)
  }, [
    selectedMonthFilter,
    selectedListing,
    selectedStatusFilter,
    selectedPropertyOwnerFilter,
  ])

  const owners = [
    { label: 'All owners', value: '' },
    ...(ownersData
      ? ownersData.map(({ name, id }) => ({
          label: name,
          value: id,
        }))
      : []),
  ]

  const events = data
    ?.map((e) => {
      return {
        ...e,
        toDate: DateString.fromString(e.toDate),
        fromDate: DateString.fromString(e.fromDate),
        bookedOn: e.bookedOn ? DateString.fromString(e.bookedOn) : undefined,
      }
    })
    .filter(
      (e) =>
        selectedMonthFilter === 'all' ||
        monthEqualsFilterMonth(e.toDate, selectedMonthFilter)
    )
    .filter((e) => selectedListing === '' || e.listingId === selectedListing)
    .filter(
      (e) => selectedStatusFilter === '' || e.status === selectedStatusFilter
    )
    .filter(
      (e) =>
        selectedPropertyOwnerFilter === '' ||
        e.propertyOwner?.id === selectedPropertyOwnerFilter
    )
    .sort((a, b) => (a.toDate > b.toDate ? 1 : -1))

  const getFileName = () => {
    const date = new Date()
    if (selectedMonthFilter != '') {
      date.setMonth(date.getMonth() + parseInt(selectedMonthFilter))
      const formatted = DateTime.fromJSDate(date).toFormat('MM-yyyy')
      return `revenue-${formatted}.csv`
    } else {
      return `revenue-${date.getFullYear()}.csv`
    }
  }

  return (
    <>
      <Flex justify="space-between">
        <Title order={1}>Revenue</Title>
        {events && (
          <CSVLink
            headers={COLUMNS}
            data={formatForCSV(events)}
            filename={getFileName()}
          >
            <Button variant="subtle" leftIcon={<IconPlus />}>
              Export to CSV
            </Button>
          </CSVLink>
        )}
      </Flex>
      <Space h="xl" />
      <Group>
        <Select
          size={'sm'}
          data={[
            { label: 'All', value: 'all' },
            {
              label: 'Last month',
              value: '-1',
            },
            { label: 'Current month', value: '0' },
            {
              label: 'Next month',
              value: '+1',
            },
          ]}
          value={selectedMonthFilter}
          icon={<IconCalendarTime size="1.25rem" />}
          onChange={(value: string | null) => {
            setSelectedMonthFilter(value ?? '')
          }}
        />
        <SelectListing
          excludeIds={[]}
          onSelect={setSelectedListing}
          selectedId={selectedListing}
          displayLabel={false}
          placeholder={'All listings'}
          allOption={true}
        />
        <Select
          size={'sm'}
          data={[
            { label: 'All statuses', value: '' },
            ...Object.values(ReservationStatus),
          ]}
          value={selectedStatusFilter}
          onChange={(value: string | null) => {
            setSelectedStatusFilter(value ?? '')
          }}
        />
        <Select
          size={'sm'}
          data={owners as SelectItem[]}
          value={selectedPropertyOwnerFilter}
          onChange={(value: string | null) => {
            setSelectedPropertyOwnerFilter(value ?? '')
          }}
        />
      </Group>
      <Space h="md" />
      <VestaSpinnerOverlay visible={isLoading} />
      {!isLoading && (
        <>
          {data && events?.length ? (
            <ReservationsTable
              events={events}
              columns={COLUMNS.filter((c) => c.display === true)}
            />
          ) : (
            <Center pt={100}>
              <Stack align={'center'} w={600}>
                <>
                  <Title order={2}>
                    You do not have any reservations that match the selected
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

export default ReservationsPage
