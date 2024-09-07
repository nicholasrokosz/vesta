import { api } from 'utils/api'
import SingleBase from './SingleBase'

interface Props {
  excludeIds: string[]
  onSelect: (listingId: string) => void
  selectedId?: string | null
  displayLabel?: boolean
  placeholder?: string
  allOption?: boolean
  error?: string | boolean | undefined
  disabled?: boolean
}

export default function SelectListing({
  excludeIds,
  onSelect,
  selectedId,
  displayLabel,
  placeholder,
  allOption,
  error = undefined,
  disabled = false,
}: Props) {
  const listingsData = api.listing.getAll.useQuery().data ?? []
  const listings = listingsData.map((listing) => {
    return {
      id: listing.id,
      name: listing.name,
      photo: listing.content?.photos ? listing.content?.photos[0] : '',
    }
  })

  return (
    <SingleBase
      excludeIds={excludeIds}
      onSelect={onSelect}
      selectedId={selectedId}
      displayLabel={displayLabel}
      placeholder={placeholder}
      allOption={allOption}
      error={error}
      disabled={disabled}
      listings={listings}
    />
  )
}
