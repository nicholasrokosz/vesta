import { api } from 'utils/api'
import RevenueDisplay from '../RevenueDisplay/RevenueDisplay'
import type { RevenueFeeCreate } from 'types/revenue'
import { useEffect } from 'react'
import type DateString from 'types/dateString'

interface Props {
  listingKey?: string
  listingId?: string
  dates: [DateString, DateString]
  guests: number
  fees: RevenueFeeCreate[]
  totalAmountCalculated?: (totalAmount: number) => void
}

const DirectRevenueEstimator = ({
  listingKey,
  dates,
  guests,
  fees,
  totalAmountCalculated,
}: Props) => {
  const { data, isLoading } = api.direct.calculateRevenueByKey.useQuery(
    {
      key: listingKey || '',
      startDate: dates[0].toString(),
      endDate: dates[1].toString(),
      guests,
      fees,
    },
    {
      enabled: !!listingKey,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  )

  useEffect(() => {
    if (!!data) {
      if (!!totalAmountCalculated) {
        totalAmountCalculated(data.totalAfterDiscount)
      }
    }
  }, [data])

  return (
    <>
      {data && !isLoading && (
        <RevenueDisplay
          nights={data?.nights || 0}
          rate={data?.accommodationRevenue / data.nights || 0}
          accommodationTotal={data.accommodationRevenue}
          taxesTotal={data?.taxesTotal}
          fees={data.fees.fees}
          guestTotal={data?.grossRevenue || 0}
        />
      )}
    </>
  )
}

export default DirectRevenueEstimator
