/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useState } from 'react'
import { createStyles, Select } from '@mantine/core'
import vestaPhotoUtil from 'utils/vestaPhoto'
import { SelectItem } from './Item'

const useStyles = createStyles(() => ({
  base: {
    width: 300,
  },
}))

interface Props {
  excludeIds: string[]
  onSelect: (listingId: string) => void
  selectedId?: string | null
  displayLabel?: boolean
  placeholder?: string
  allOption?: boolean
  error?: string | boolean | undefined
  disabled?: boolean
  listings: { id: string; name: string; photo: string }[]
}

export default function SingleBase({
  excludeIds,
  onSelect,
  selectedId,
  displayLabel,
  placeholder,
  allOption,
  error = undefined,
  disabled = false,
  listings,
}: Props) {
  const { classes } = useStyles()
  const [listingId, setListingId] = useState<string | null | undefined>()

  useEffect(() => {
    setListingId(selectedId)
  }, [selectedId])

  const listingOptions = listings
    .filter((listing) => !excludeIds.includes(listing.id))
    .map((listing) => {
      return {
        value: listing.id,
        label: listing.name,
        image: vestaPhotoUtil.getSmall(listing.photo),
      }
    })
  if (allOption) {
    listingOptions.unshift({
      value: '',
      label: 'All listings',
      image: '',
    })
  }

  const handleError = () => {
    if (typeof error === 'string') return error
    if (typeof error === 'boolean') return 'Required'
  }

  return (
    <div className={classes.base}>
      <Select
        label={displayLabel ? 'Choose a listing' : undefined}
        placeholder={placeholder ? placeholder : 'Select a listing'}
        itemComponent={SelectItem}
        data={listingOptions}
        value={listingId}
        onChange={onSelect}
        error={handleError()}
        searchable
        withAsterisk
        disabled={disabled}
      />
    </div>
  )
}
