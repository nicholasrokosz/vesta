import {
  useMantineTheme,
  Stack,
  Title,
  Flex,
  Tabs,
  createStyles,
  Space,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconX } from '@tabler/icons-react'
import { api } from 'utils/api'
import Overview from './Overview'
import Property from './Property'

const useStyles = createStyles((theme) => ({
  headerText: {
    fontSize: theme.fontSizes.lg,
  },
}))

interface Props {
  eventId: string
  listingId: string
  onClose: () => void
}

const TripPanel = ({ eventId, listingId, onClose }: Props) => {
  const { classes } = useStyles()
  const { data: thisEvent, isLoading: eventLoading } =
    api.calendar.getById.useQuery({ id: eventId })

  const theme = useMantineTheme()
  const mobileView = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

  return (
    <Stack spacing="xs" maw={394}>
      {!eventLoading && thisEvent && (
        <>
          {!mobileView && (
            <Flex
              direction={'row'}
              justify={'space-between'}
              align={'flex-start'}
              pt="sm"
              pb="sm"
              pl="lg"
            >
              <Title className={classes.headerText}>Trip info</Title>
              <IconX onClick={onClose} style={{ cursor: 'pointer' }} />
            </Flex>
          )}
          <Tabs defaultValue="overview" pl={mobileView ? 0 : 'lg'}>
            <Tabs.List>
              <Tabs.Tab value="overview" fz="md">
                Overview
              </Tabs.Tab>
              <Tabs.Tab value="property" fz="md">
                Property
              </Tabs.Tab>
            </Tabs.List>
            <Space h="lg" />
            <Tabs.Panel value="overview">
              <Overview event={thisEvent} listingId={listingId} />
            </Tabs.Panel>

            <Tabs.Panel value="property" pt="xs">
              <Property event={thisEvent} />
            </Tabs.Panel>
          </Tabs>
        </>
      )}
    </Stack>
  )
}

export default TripPanel
