import {
  createStyles,
  Box,
  Flex,
  Text,
  Paper,
  Stack,
  Indicator,
  Divider,
} from '@mantine/core'
import { useRouter } from 'next/router'
import { DateTime } from 'luxon'
import Link from 'next/link'
import type { IMessageThread } from 'types/messages'
import { ReservationStatus } from 'types/reservation'
import { MessageMenu } from 'components/messages'
import ChannelTag from 'components/common/ChannelTag/ChannelTag'

const useStyles = createStyles((theme) => ({
  paper: {
    overflow: 'hidden',
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    paddingLeft: theme.spacing.xs,
    paddingRight: theme.spacing.xs,
    borderRadius: 0,
  },
  name: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 700,
  },
  status: {
    fontSize: theme.fontSizes.sm,
    fontWeight: 700,
    backgroundColor: theme.colors.gray[1],
    padding: '2px 6px', // NOTE: Sometimes theme spacing values don't cut it
    borderRadius: theme.radius.sm,
  },
  statusInquiry: {
    color: theme.colors.green[9],
    backgroundColor: theme.colors.green[0],
  },
  selected: {
    backgroundColor: theme.colors.vesta[0],
    borderLeft: `3px solid ${theme.colors.vesta[4]} !important`,
    paddingLeft: 14, // NOTE: Another example of the need for non-theme spacing values
  },
  timestamp: {
    fontSize: theme.fontSizes.xs,
  },
}))

interface Props {
  thread: IMessageThread
  selected?: boolean
  onToggleRead: () => void
  onToggleArchived: () => void
  onReminderDismissed: () => void
}

const ThreadCard = ({
  thread,
  selected,
  onToggleRead,
  onToggleArchived,
  onReminderDismissed,
}: Props) => {
  const { classes, cx } = useStyles()
  const router = useRouter()

  // HACK: Find a better way to do this routing
  const currentId = router.asPath
    .split('/')
    .find((str) => str.startsWith('c') && str.length === 25)
  const url = currentId
    ? router.asPath
        .split('/')
        .map((str, i, arr) => (i === arr.length - 1 ? thread.id : str))
        .join('/')
    : `${router.asPath}/${thread.id}`

  const enableOverdueReminder = thread.enableReminder && thread.isOverdue

  return (
    <Link href={url}>
      <Paper className={cx(classes.paper, { [classes.selected]: selected })}>
        <Stack spacing={6}>
          <Flex justify={'space-between'} align={'center'}>
            <Flex>
              <ChannelTag channel={thread.channel} showText={false} />
              <Text lineClamp={1} ml={2}>
                {thread.listing.name}
              </Text>
            </Flex>
            <Flex>
              <Box
                className={cx(classes.status, {
                  [classes.statusInquiry]:
                    thread.status == ReservationStatus.INQUIRY,
                })}
              >
                {thread.status}
              </Box>
              <Box mr={-10}>
                <MessageMenu
                  enableMarkAsRead={
                    thread.messages.length > 0 && !thread.archived
                  }
                  enableDismissReminder={
                    thread.messages.length > 0 &&
                    !thread.archived &&
                    enableOverdueReminder
                  }
                  read={thread.unreadMessageCount == 0}
                  archived={thread.archived}
                  threadId={thread.id}
                  onToggleRead={onToggleRead}
                  onToggleArchived={onToggleArchived}
                  onReminderDismissed={onReminderDismissed}
                />
              </Box>
            </Flex>
          </Flex>
          <Flex direction="row" wrap="nowrap" align="center">
            <Flex direction="column" w={'100%'}>
              <Flex direction="row" justify="space-between">
                <Text className={classes.name} lineClamp={1} w={'60%'}>
                  {thread.guestName}
                </Text>
                <Text fz="sm" fw={600}>
                  {thread.messages.length > 0 &&
                    DateTime.fromJSDate(thread.lastMessageSentAt).toRelative()}
                </Text>
              </Flex>

              <Indicator
                mr={3}
                inline
                color={enableOverdueReminder ? 'red.9' : 'vesta'}
                position="bottom-end"
                label={
                  enableOverdueReminder ? '!' : `${thread.unreadMessageCount}`
                }
                disabled={
                  thread.archived ||
                  (!enableOverdueReminder && thread.unreadMessageCount === 0)
                }
                processing={enableOverdueReminder}
              >
                <Text lineClamp={1} mr="xs" w={'95%'}>
                  {thread.lastMessageText}
                </Text>
              </Indicator>
            </Flex>
          </Flex>
        </Stack>
      </Paper>
      <Divider size="xs" />
    </Link>
  )
}

export default ThreadCard
