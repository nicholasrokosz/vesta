import {
  createStyles,
  useMantineTheme,
  Text,
  Stack,
  Divider,
  Flex,
} from '@mantine/core'
import { formatTimeWithZone } from 'utils/dateFormats'
import { DateTime } from 'luxon'
import ChannelTag from 'components/common/ChannelTag/ChannelTag'
import { IconMoodKid, IconUser } from '@tabler/icons-react'
import { useMediaQuery } from '@mantine/hooks'

const useStyles = createStyles((theme) => ({
  address: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.gray[9],
    opacity: 0.5,
  },
  checkInLabel: {
    color: '#9DA3AF',
    fontWeight: 700,
  },
  checkInDate: {
    fontWeight: 600,
    fontSize: theme.fontSizes.md,
  },
  person: {
    color: theme.colors.gray[6],
  },
  personIcon: {
    marginRight: theme.spacing.xs,
    color: theme.colors.gray[6],
  },
}))

interface Props {
  event: {
    id: string
    address: string
    listingName: string
    timeZone: string
    unitType: string
    adults: number
    children: number
    name: string
    email: string
    channel: string
    guests: string
    checkin: Date
    checkout: Date
    nights: string
    status: string
    confirmationCode: string
  }
}

const TripInfo = ({ event }: Props) => {
  const { classes } = useStyles()
  const theme = useMantineTheme()
  const mobileView = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

  return (
    <Flex w="100%" maw={900} direction={mobileView ? 'column' : 'row'}>
      <Stack
        justify="space-between"
        w={mobileView ? '100%' : '50%'}
        py="md"
        px="xl"
      >
        <Stack>
          <Flex justify="space-between">
            <Text fz="lg" fw="bold">
              {event.listingName}
            </Text>
            <ChannelTag channel={event.channel} showText={true} />
          </Flex>
          <Text className={classes.address}>
            {event.unitType} • {event.address}
          </Text>
        </Stack>
        {event.confirmationCode && (
          <Flex justify="space-between">
            <Text>Confirmation code</Text>
            <Text>{event.confirmationCode}</Text>
          </Flex>
        )}
      </Stack>

      <Divider orientation="vertical" />

      <Stack
        justify="space-between"
        w={mobileView ? '100%' : '50%'}
        py="md"
        px="xl"
      >
        <Text fz="lg" fw="bold">
          {event.name}
        </Text>
        <Flex direction={'row'} justify={'space-between'} mb={24}>
          <div>
            <div className={classes.checkInLabel}>Check-in</div>
            <div className={classes.checkInDate}>
              {DateTime.fromJSDate(event.checkin).toFormat('MMM d yyyy')}
            </div>
            {formatTimeWithZone(event.checkin, event.timeZone)}
          </div>
          <div>
            <div className={classes.checkInLabel}>Checkout</div>
            <div className={classes.checkInDate}>
              {DateTime.fromJSDate(event.checkout).toFormat('MMM d yyyy')}
            </div>
            {formatTimeWithZone(event.checkout, event.timeZone)}
          </div>
        </Flex>
      </Stack>

      <Divider orientation="vertical" />

      <Flex
        w={170}
        py="md"
        px="xl"
        gap="md"
        direction={mobileView ? 'row' : 'column'}
      >
        <Flex align={'center'}>
          <IconUser className={classes.personIcon} />
          <span className={classes.person}>Adults</span>
          <Text fw={'bold'} ml="xs">
            {event.adults}
          </Text>
        </Flex>
        <Flex align={'center'}>
          <IconMoodKid className={classes.personIcon} />
          <span className={classes.person}>Kids</span>
          <Text fw={'bold'} ml="xs">
            {event.children}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default TripInfo
