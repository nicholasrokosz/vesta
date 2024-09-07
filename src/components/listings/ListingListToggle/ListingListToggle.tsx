import { SegmentedControl, Center, Box } from '@mantine/core'
import { IconLayoutList, IconLayoutGrid } from '@tabler/icons-react'

interface Props {
  view: string
  setView: ((value: string) => void) | undefined
}

const ListingListToggle = (props: Props) => {
  return (
    <SegmentedControl
      color="vesta"
      radius={'sm'}
      transitionDuration={0}
      value={props.view}
      onChange={props.setView}
      data={[
        {
          label: (
            <Center>
              <IconLayoutGrid />
              <Box ml={10}>Card View</Box>
            </Center>
          ),
          value: 'card',
        },
        {
          label: (
            <Center>
              <IconLayoutList />
              <Box ml={10}>List View</Box>
            </Center>
          ),
          value: 'list',
        },
      ]}
    />
  )
}

export default ListingListToggle
