import { type NextPage } from 'next'
import { useEffect } from 'react'
import { DateTime } from 'luxon'
import { Space, Stack } from '@mantine/core'
import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'
import RentalRevenueTable from 'components/ownerstatement/RentalRevenueTable/RentalRevenueTable'
import { api } from 'utils/api'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import StatementHeader from 'components/ownerstatement/Header/Header'
import StatementSummaryTable from 'components/ownerstatement/StatementSummaryTable/StatementSummaryTable'
import { useRouter } from 'next/router'
import GuestFeeRevenueTable from 'components/ownerstatement/GuestFeeRevenueTable/GuestFeeRevenueTable'
import ExpensesTable from 'components/ownerstatement/ExpensesTable/ExpensesTable'
import { useIsPrintable } from 'utils/hooks'

const DraftStatement: NextPage = () => {
  const router = useRouter()
  const isPrintable = useIsPrintable()

  const listingId = router.query.listingId as string
  const month = parseInt(router.query.month as string)
  const year = parseInt(router.query.year as string)

  const { data, isLoading, refetch } = api.ownerStatements.getDraft.useQuery(
    {
      listingId,
      month,
      year,
    },
    {
      enabled:
        !!router.query.listingId && !!router.query.year && !!router.query.month,
    }
  )

  useEffect(() => {
    if (data?.id) {
      void router.push(`/financials/ownerstatements/${data.id}`)
    }
  }, [data])

  return (
    <>
      <VestaSpinnerOverlay visible={isLoading} />
      {data && data.statement && refetch && (
        <Stack>
          {!isPrintable && (
            <>
              <Breadcrumbs
                links={[
                  {
                    title: 'Owner statements',
                    href: '/financials/ownerstatements',
                  },
                  {
                    title: `${data.statement.listingName} - ${
                      DateTime.fromObject({
                        month: data.statement.month,
                        year: data.statement.year,
                      }).monthLong
                    } ${data.statement.year}`,
                  },
                ]}
              />
              <Space h="sm" />
            </>
          )}
          <StatementHeader
            onLocked={() => {
              void refetch()
            }}
            isLocked={false}
            month={month}
            year={year}
            listing={data.listing}
            ownerPortal={false}
          />
          <Space h="sm" />
          <StatementSummaryTable statement={data.statement} />
          <Space h="sm" />
          <RentalRevenueTable
            accommodationRevenue={data.statement.accommodationRevenue}
          />
          <Space h="sm" />
          <GuestFeeRevenueTable
            guestFeeRevenue={data.statement.guestFeeRevenue}
          />
          <Space h="sm" />
          <ExpensesTable expenses={data.statement.expenses} />
        </Stack>
      )}
    </>
  )
}

export default DraftStatement
