import * as React from 'react'
import { render, screen } from 'utils/testing/RenderWithProviders'
import ListingAvatars from './ListingAvatars'

describe('Listing Avatars', () => {
  const listings = [
    { name: 'Listing 1', photo: 'photo1.png' },
    { name: 'Listing 2', photo: 'photo2.png' },
    { name: 'Listing 3', photo: 'photo3.png' },
    { name: 'Listing 4', photo: 'photo4.png' },
    { name: 'Listing 5', photo: 'photo5.png' },
    { name: 'Listing 6', photo: 'photo6.png' },
  ]

  it('displays zero listings correctly', () => {
    render(<ListingAvatars listings={[]} />)

    expect(screen.queryAllByRole('img').length).toBe(0)
  })

  it('displays two listings correctly', () => {
    render(<ListingAvatars listings={listings.slice(0, 2)} />)

    expect(screen.queryAllByRole('img').length).toBe(2)
  })

  it('displays four listings correctly', () => {
    render(<ListingAvatars listings={listings.slice(0, 4)} />)

    expect(screen.queryAllByRole('img').length).toBe(4)
  })

  it('displays five listings correctly', () => {
    render(<ListingAvatars listings={listings.slice(0, 5)} />)

    expect(screen.queryAllByRole('img').length).toBe(4)
    expect(screen.getByText('+1')).toBeInTheDocument()
  })
  it('displays six listings correctly', () => {
    render(<ListingAvatars listings={listings.slice(0, 6)} />)

    expect(screen.queryAllByRole('img').length).toBe(4)
    expect(screen.getByText('+2')).toBeInTheDocument()
  })
})
