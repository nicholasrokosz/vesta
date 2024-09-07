import { type NextPage } from 'next'
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
import { DateTime } from 'luxon'

const Statement: NextPage = () => {
  const router = useRouter()
  const isPrintable = useIsPrintable()

  const { data, isLoading } = api.owner.getStatement.useQuery(
    {
      id: router.query.id as string,
    },
    { enabled: !!router.query.id }
  )

  return (
    <>
      <VestaSpinnerOverlay visible={isLoading} />
      {data && data.statement && (
        <Stack>
          {!isPrintable && (
            <>
              <Breadcrumbs
                links={[
                  {
                    title: 'Statements',
                    href: '/owner/statements',
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
            isLocked={true}
            month={data.statement.month}
            year={data.statement.year}
            ownerPortal={false}
            listing={data.listing}
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

export default Statement
