import * as React from 'react'
import { render, screen } from 'utils/testing/RenderWithProviders'
import ChannelTag from './ChannelTag'
import { Channel } from '@prisma/client'

describe('Channel Tag', () => {
  it('displays the airbnb channel logo', () => {
    render(<ChannelTag channel={Channel.Airbnb} />)
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', '/icon-airbnb.svg')
    expect(image).toHaveAttribute('alt', 'Airbnb')
    expect(screen.queryAllByText('Airbnb').length).toBe(0)
  })

  it('displays the vbro channel logo', () => {
    render(<ChannelTag channel={Channel.VRBO} />)
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', '/icon-vrbo.svg')
    expect(image).toHaveAttribute('alt', 'VRBO')
    expect(screen.queryAllByText('VRBO').length).toBe(0)
  })

  it('displays the booking.com channel logo', () => {
    render(<ChannelTag channel={Channel.Booking} />)
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', '/icon-booking.svg')
    expect(image).toHaveAttribute('alt', 'Booking.com')
    expect(screen.queryAllByText('Booking.com').length).toBe(0)
  })

  it('displays the direct booking channel logo', () => {
    render(<ChannelTag channel={Channel.Direct} />)
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', '/icon-direct.svg')
    expect(image).toHaveAttribute('alt', 'Direct booking')
    expect(screen.queryAllByText('Direct').length).toBe(0)
  })

  it('displays the airbnb grayscale channel logo', () => {
    render(<ChannelTag channel={Channel.Airbnb} grayscale={true} />)
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', '/icon-airbnb-grayscale.svg')
  })

  it('displays the vbro grayscale channel logo', () => {
    render(<ChannelTag channel={Channel.VRBO} grayscale={true} />)
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', '/icon-vrbo-grayscale.svg')
  })

  it('displays the booking.com grayscale channel logo', () => {
    render(<ChannelTag channel={Channel.Booking} grayscale={true} />)
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', '/icon-booking-grayscale.svg')
  })

  it('displays the direct booking channel grayscale logo', () => {
    render(<ChannelTag channel={Channel.Direct} grayscale={true} />)
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', '/icon-direct.svg') // Regular is grayscale
  })

  it('displays the channel name', () => {
    render(<ChannelTag channel={Channel.Airbnb} showText={true} />)
    const text = screen.getByText('Airbnb')
    expect(text).toBeInTheDocument()
  })

  it('displays the booking.com channel name', () => {
    render(<ChannelTag channel={Channel.Booking} showText={true} />)
    const text = screen.getByText('Booking.com')
    expect(text).toBeInTheDocument()
  })
})
