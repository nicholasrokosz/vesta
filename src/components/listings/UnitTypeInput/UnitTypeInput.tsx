import { SegmentedControl, Center, Box } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import { UnitType } from '@prisma/client'
import type { Listing } from 'types/listings'

interface Props {
  form: UseFormReturnType<Listing>
}

const UnitTypeInput = (props: Props) => {
  const unitTypes = (Object.keys(UnitType) as Array<keyof typeof UnitType>).map(
    (key) => {
      return {
        label: (
          <Center>
            <Box ml={5} mr={5}>
              {UnitType[key]}
            </Box>
          </Center>
        ),
        value: UnitType[key],
      }
    }
  )

  return (
    <SegmentedControl
      color="vesta"
      radius={'sm'}
      transitionDuration={0}
      data={unitTypes}
      {...props.form.getInputProps('unitType')}
    />
  )
}

export default UnitTypeInput
