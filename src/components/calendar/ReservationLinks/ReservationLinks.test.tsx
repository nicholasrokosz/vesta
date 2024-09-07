import * as React from 'react'
import { render, screen } from 'utils/testing/RenderWithProviders'
import ReservationLinks from './ReservationLinks'

describe('Event Links', () => {
  const messageThreadId = '1234'
  const reservationId = '4321'

  it('renders the urls', () => {
    render(
      <ReservationLinks
        messageThreadId={messageThreadId}
        reservationId={reservationId}
        disableFinancials={false}
      />
    )

    expect(screen.getByRole('link', { name: 'Messages' })).toHaveAttribute(
      'href',
      '/messages/all/1234'
    )
    expect(screen.getByRole('link', { name: 'Financials' })).toHaveAttribute(
      'href',
      '/financials/revenue/4321'
    )
  })

  it('does not render financials url as link when disabled', () => {
    render(
      <ReservationLinks
        messageThreadId={messageThreadId}
        reservationId={reservationId}
        disableFinancials={true}
      />
    )

    expect(screen.queryByRole('link', { name: 'Financials' })).toBeNull()
    expect(screen.getByText('Financials')).toBeInTheDocument()
  })

  it('does not render messages url as link when no messageThread', () => {
    render(
      <ReservationLinks
        messageThreadId={undefined}
        reservationId={reservationId}
        disableFinancials={false}
      />
    )

    expect(screen.queryByRole('link', { name: 'Messages' })).toBeNull()
    expect(screen.getByText('Messages')).toBeInTheDocument()
  })
})
