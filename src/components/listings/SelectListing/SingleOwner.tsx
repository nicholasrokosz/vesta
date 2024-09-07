import { api } from 'utils/api'
import SingleBase from './SingleBase'
import { useRouter } from 'next/router'

interface Props {
  excludeIds: string[]
  onSelect: (listingId: string) => void
  displayLabel?: boolean
  placeholder?: string
  allOption?: boolean
  error?: string | boolean | undefined
  disabled?: boolean
}

export default function SelectSingleOwner(props: Props) {
  const router = useRouter()

  const listingsData = api.owner.getListings.useQuery().data ?? []
  const listings = listingsData.map((listing) => {
    return {
      id: listing.id,
      name: listing.name,
      photo: listing.content?.photos ? listing.content?.photos[0] : '',
    }
  })

  let listingId = router.query.listingId as string
  if (!listingId && listings.length > 0) {
    listingId = listings[0].id
    void router.push({
      pathname: router.route,
      query: { ...router.query, listingId },
    })
  }

  if (listingId) props.onSelect(listingId)

  return (
    <>
      {listings.length > 1 && (
        <SingleBase
          {...props}
          selectedId={listingId}
          onSelect={(listingId) => {
            void router.push({
              pathname: router.route,
              query: { ...router.query, listingId },
            })
          }}
          listings={listings}
        />
      )}
    </>
  )
}
