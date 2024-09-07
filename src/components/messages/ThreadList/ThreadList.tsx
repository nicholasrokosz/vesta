import {
  createStyles,
  Divider,
  Flex,
  Stack,
  Text,
  Center,
  Space,
  Button,
  ScrollArea,
} from '@mantine/core'
import type { IMessageThread } from 'types/messages'
import { ReservationStatus } from 'types/reservation'
import { useRouter } from 'next/router'
import { ThreadCard } from 'components/messages'
import { v4 as uuidv4 } from 'uuid'

const useStyles = createStyles((theme) => ({
  header: {
    fontStyle: 'normal',
    fontWeight: 700,
    fontSize: 26,
    lineHeight: '135%',
  },
  filter: {
    fontSize: 14,
    padding: '3px 6px',
    minWidth: 'fit-content',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  filterUnselected: { backgroundColor: theme.colors.white },
  filterSelected: {
    backgroundColor: theme.colors.gray[3],
  },
  noMatches: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 600,
  },
  modalTitle: {
    fontSize: '26px',
    marginTop: '-45px',
  },
}))

interface Props {
  threads: IMessageThread[]
  selectedFilter: string
  setSelectedFilter: (filter: string) => void
  onToggleRead: () => void
  onToggleArchived: () => void
  onReminderDismissed: () => void
}

const ThreadList = ({
  threads,
  selectedFilter,
  setSelectedFilter,
  onToggleRead,
  onToggleArchived,
  onReminderDismissed,
}: Props) => {
  const { classes } = useStyles()
  const router = useRouter()

  const selectedThreadId = router.query.id

  return (
    <Stack spacing={0} w="100%" maw={350}>
      <ScrollArea offsetScrollbars>
        <Flex w={'100%'} maw={275} gap="xxxs" direction="row">
          <Button
            size="xs"
            variant="subtle"
            color="neutral"
            className={`${classes.filter} ${
              selectedFilter ? classes.filterUnselected : classes.filterSelected
            }`}
            onClick={() => setSelectedFilter('')}
          >
            All
          </Button>
          {Object.entries(ReservationStatus).map(([key, value]) => (
            <Button
              key={key}
              size="xs"
              variant="subtle"
              color="neutral"
              className={`${classes.filter} ${
                selectedFilter == value
                  ? classes.filterSelected
                  : classes.filterUnselected
              }`}
              onClick={() => setSelectedFilter(value)}
            >
              {value}
            </Button>
          ))}
        </Flex>
      </ScrollArea>
      <Divider size="xs" />
      {threads.length === 0 && selectedThreadId ? (
        <>
          <Space h="xl" />
          <Center>
            <Text w="80%">
              There are no messages to display. Please try another filter.
            </Text>
          </Center>
        </>
      ) : (
        threads.map((thread: IMessageThread) => {
          return (
            <ThreadCard
              thread={thread}
              key={uuidv4()}
              selected={selectedThreadId === thread.id}
              onToggleRead={onToggleRead}
              onToggleArchived={onToggleArchived}
              onReminderDismissed={onReminderDismissed}
            />
          )
        })
      )}
    </Stack>
  )
}

export default ThreadList
