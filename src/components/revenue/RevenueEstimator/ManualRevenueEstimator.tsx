import { useEffect } from 'react'
import { api } from 'utils/api'
import type { RevenueFeeCreate } from 'types/revenue'
import RevenueDisplay from '../RevenueDisplay/RevenueDisplay'
import type DateString from 'types/dateString'

interface Props {
  listingId: string
  dates: [DateString, DateString]
  feeIds: string[]
  guests: number
  discount: number
  feesCalculated?: (fees: RevenueFeeCreate[]) => void
  accommodationRevenueCalculated?: (accommodationRevenue: number) => void
}

const ManualRevenueEstimator = ({
  listingId,
  dates,
  feeIds,
  guests,
  discount,
  feesCalculated,
  accommodationRevenueCalculated,
}: Props) => {
  const { data: revenue, isLoading } = api.revenue.calculateRevenue.useQuery(
    {
      listingId: listingId || '',
      startDate: dates[0].toString(),
      endDate: dates[1].toString(),
      feeIds,
      guests,
      discount,
    },
    { enabled: !!listingId }
  )

  useEffect(() => {
    if (revenue && feesCalculated && accommodationRevenueCalculated) {
      feesCalculated(revenue.fees.fees)
      accommodationRevenueCalculated(revenue.accommodationRevenue)
    }
  }, [revenue])

  return (
    <>
      {revenue && !isLoading && (
        <RevenueDisplay
          nights={revenue.nights}
          rate={revenue?.accommodationRevenue / revenue.nights || 0}
          accommodationTotal={revenue.accommodationRevenue}
          fees={revenue.fees.fees}
          taxesTotal={revenue?.taxesTotal || 0}
          guestTotal={revenue?.grossRevenue || 0}
          discount={revenue.discount}
          totalAfterDiscount={revenue.totalAfterDiscount}
        />
      )}
    </>
  )
}

export default ManualRevenueEstimator
