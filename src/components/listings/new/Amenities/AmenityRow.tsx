import React, { useState, useEffect } from 'react'
import { createStyles, TextInput, Switch } from '@mantine/core'
import type { IAmenity } from 'types'

const useStyles = createStyles(() => ({
  label: {
    fontSize: '1rem',
    fontWeight: 600,
  },
  amenityColumn: {
    width: 300,
  },
}))

interface AmenityRowProps {
  name: string
  typeId: string
  checked: boolean
  note: string
  amenities: IAmenity[]
  setAmenities: (amenities: IAmenity[]) => void
  syncAmenityButtons: (typeId: string, selected: boolean) => void
}

const AmenityRow = ({
  name,
  typeId,
  checked,
  note,
  amenities,
  setAmenities,
  syncAmenityButtons,
}: AmenityRowProps) => {
  const { classes } = useStyles()
  const [value, setValue] = useState<string>(note)
  const index = amenities.findIndex((amenity) => amenity.typeId === typeId)

  useEffect(() => {
    if (note) setValue(note)
  }, [note])

  useEffect(() => {
    const amenitiesCopy = [...amenities]
    amenitiesCopy[index].note = value
    setAmenities(amenitiesCopy)
  }, [value])

  const handleCheck = (): void => {
    const amenitiesCopy = [...amenities]
    amenitiesCopy[index] = { ...amenitiesCopy[index], checked: !checked }
    syncAmenityButtons(typeId, !checked)
    setAmenities(amenitiesCopy)
  }

  return (
    <tr>
      <td className={classes.amenityColumn}>
        <Switch
          checked={checked}
          onChange={() => handleCheck()}
          label={name}
          classNames={{ label: classes.label }}
        />
      </td>
      <td>
        <TextInput
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          disabled={!checked}
        />
      </td>
    </tr>
  )
}

export default React.memo(AmenityRow)
