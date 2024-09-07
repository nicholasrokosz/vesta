/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useState } from 'react'
import { createStyles, MultiSelect } from '@mantine/core'
import { api } from 'utils/api'
import vestaPhotoUtil from 'utils/vestaPhoto'
import { SelectItem } from './Item'
import { MultiSelectItem } from './ItemLabel'

const useStyles = createStyles(() => ({
  base: {
    width: 300,
  },
}))

interface Props {
  excludeIds: string[]
  onSelect: (listingIds: string[]) => void
  selectedIds?: string[] | null
}

export default function SelectListings({
  excludeIds,
  onSelect,
  selectedIds,
}: Props) {
  const listings = api.listing.getAll.useQuery().data ?? []
  const { classes } = useStyles()
  const [listingIds, setListingIds] = useState<string[]>()

  useEffect(() => {
    if (selectedIds) setListingIds(selectedIds)
  }, [selectedIds])

  const listingOptions = listings
    .filter((listing) => !excludeIds.includes(listing.id))
    .map((listing) => {
      const photo = listing.content?.photos ? listing.content?.photos[0] : ''
      return {
        value: listing.id,
        label: listing.name,
        image: vestaPhotoUtil.getSmall(photo),
      }
    })

  return (
    <div className={classes.base}>
      <MultiSelect
        placeholder="Pick listings"
        valueComponent={MultiSelectItem}
        itemComponent={SelectItem}
        data={listingOptions}
        value={listingIds}
        onChange={onSelect}
        searchable
        clearable
      />
    </div>
  )
}
