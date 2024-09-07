import { Stack, Text, Title, Flex } from '@mantine/core'
import type { IButtonAmenity } from 'types'
import AmenityButton from './AmenityButton'

interface Props {
  amenities: IButtonAmenity[]
  setAmenityButtons: (amenityButtons: IButtonAmenity[]) => void
  syncAmenitiesTable: (typeId: string, checked: boolean) => void
}

const AmenitySection = ({
  amenities,
  setAmenityButtons,
  syncAmenitiesTable,
}: Props) => {
  return (
    <Stack>
      <Title order={2} mt={12}>
        Core amenities
      </Title>
      <Text fz={14} fw={500} mt={12}>
        Standout amenities
      </Text>
      <Flex wrap="wrap" gap="sm">
        {amenities.map((amenity, index) => (
          <AmenityButton
            key={index}
            amenity={amenity}
            index={index}
            amenityButtons={amenities}
            setAmenityButtons={setAmenityButtons}
            syncAmenitiesTable={syncAmenitiesTable}
          />
        ))}
      </Flex>
    </Stack>
  )
}

export default AmenitySection
