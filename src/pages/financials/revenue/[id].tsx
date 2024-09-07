import { type NextPage } from 'next'
import { useRouter } from 'next/router'
import { Space, Stack } from '@mantine/core'

import { api } from 'utils/api'

import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'

import {
  SummaryTable,
  AccommodationTable,
  GuestFeeTable,
  TripInfo,
} from 'components/revenue'

const Revenue: NextPage = () => {
  const router = useRouter()
  const id = router.query.id as string

  const { data, isLoading } = api.revenue.getReservationRevenue.useQuery(
    {
      reservationId: id,
    },
    { enabled: !!id }
  )

  return (
    <>
      <Breadcrumbs
        links={[
          { title: 'Revenue', href: '/financials/revenue' },
          { title: id },
        ]}
      />
      <Space h="xl" />

      <VestaSpinnerOverlay visible={isLoading} />
      {!isLoading && data && (
        <Stack>
          <TripInfo event={data.reservation} />

          <SummaryTable revenue={data.revenue} />

          <Space h="xs" />
          <AccommodationTable
            accommodationRevenue={data.revenue.accommodationRevenue}
            reservation={data.reservation}
          />

          <Space h="xs" />
          <GuestFeeTable guestFeeRevenue={data.revenue.guestFeeRevenue} />

          <Space h="xs" />
        </Stack>
      )}
    </>
  )
}

export default Revenue
