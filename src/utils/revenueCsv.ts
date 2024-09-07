import type { IRevenueEvent } from 'types/revenue'
import { formatCurrency } from './formatCurrency'

export const COLUMNS = [
  { label: 'Listing', key: 'listingName', format: 'string', display: true },
  { label: 'Channel', key: 'channel', format: 'string', display: true },
  { label: 'Guest name', key: 'name', format: 'string', display: true },
  { label: 'Status', key: 'status', format: 'string', display: true },
  { label: 'Booked on', key: 'bookedOn', format: 'string', display: false },
  { label: 'Check-in', key: 'fromDate', format: 'string', display: true },
  { label: 'Checkout', key: 'toDate', format: 'string', display: true },
  {
    label: 'Confirmation code',
    key: 'confirmationCode',
    format: 'string',
    display: true,
  },
  {
    label: 'Number of nights',
    key: 'numberOfNights',
    format: 'number',
    display: false,
  },
  {
    label: 'Effective ADR',
    key: 'effectiveAdr',
    format: 'currency',
    display: false,
  },
  {
    label: 'Gross booking value',
    key: 'grossBookingValue',
    format: 'currency',
    display: true,
  },
  {
    label: 'Accommodation revenue',
    key: 'accommodationRevenue',
    format: 'currency',
    display: false,
  },
  {
    label: 'Total guest fees',
    key: 'totalGuestFees',
    format: 'currency',
    display: false,
  },
  {
    label: 'Municpal tax',
    key: 'municipalTax',
    format: 'currency',
    display: false,
  },
  {
    label: 'County tax',
    key: 'countyTax',
    format: 'currency ',
    display: false,
  },
  {
    label: 'State tax',
    key: 'stateTax',
    format: 'currency',
    display: false,
  },
  {
    label: 'Property manager proceeds',
    key: 'propertyManagerProceeds',
    format: 'currency',
    display: false,
  },
  {
    label: 'Property owner proceeds',
    key: 'propertyOwnerProceeds',
    format: 'currency',
    display: false,
  },
  {
    label: 'Guest name',
    key: 'guestName',
    format: 'text',
    display: false,
  },
  {
    label: 'Guest email',
    key: 'guestEmail',
    format: 'text',
    display: false,
  },
]

export const formatForCSV = (reservations: IRevenueEvent[]) => {
  return reservations.map((reservation) => {
    return {
      listingName: reservation.listingName,
      channel: reservation.channel,
      name: reservation.name,
      status: reservation.status,
      guestName: reservation.name,
      guestEmail: reservation.email,
      fromDate: reservation.fromDate.toFormattedString(),
      toDate: reservation.toDate.toFormattedString(),
      confirmationCode: reservation.confirmationCode,
      numberOfNights: reservation.numberOfNights,
      effectiveAdr: formatCurrency(
        reservation.revenue.accommodationRevenue.taxableRoomRate
      ),
      grossBookingValue: formatCurrency(
        reservation.revenue.grossBookingValue.amount
      ),
      accommodationRevenue: formatCurrency(
        reservation.revenue.accommodationRevenue.netRevenue.amount
      ),
      totalGuestFees: formatCurrency(
        reservation.revenue.guestFeeRevenue.guestFeesNet.amount
      ),
      municipalTax: formatCurrency(
        reservation.revenue.allTaxes
          .filter((tax) => tax.description === 'Municipal tax')
          .reduce((acc2, cur2) => acc2 + (cur2?.value.amount || 0), 0)
      ),
      countyTax: formatCurrency(
        reservation.revenue.allTaxes
          .filter((tax) => tax.description === 'County tax')
          .reduce((acc2, cur2) => acc2 + (cur2?.value.amount || 0), 0)
      ),
      stateTax: formatCurrency(
        reservation.revenue.allTaxes
          .filter((tax) => tax.description === 'State tax')
          .reduce((acc2, cur2) => acc2 + (cur2?.value.amount || 0), 0)
      ),
      propertyManagerProceeds: formatCurrency(
        reservation.revenue.netRevenue.managerAmount
      ),
      propertyOwnerProceeds: formatCurrency(
        reservation.revenue.netRevenue.ownerAmount
      ),
      bookedOn: reservation.bookedOn
        ? reservation.bookedOn.toFormattedString()
        : '',
    }
  })
}
