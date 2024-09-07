import { useState } from 'react'
import {
  createStyles,
  Title,
  Space,
  Flex,
  Text,
  Center,
  Box,
} from '@mantine/core'
import { ThreadList } from 'components/messages'
import type { ReactNode } from 'react'
import type { ReservationStatus } from 'types/reservation'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import { api } from 'utils/api'
import { useRouter } from 'next/router'

const useStyles = createStyles(() => ({
  header: {
    fontStyle: 'normal',
    fontWeight: 700,
    fontSize: 26,
    lineHeight: '135%',
  },
}))

const MessagesLayout = ({ children }: { children?: ReactNode }) => {
  const router = useRouter()
  const { data, status, refetch } = api.messages.getAll.useQuery()
  const { refetch: refetchUnreadOverdue } =
    api.messages.getUnreadOverdue.useQuery()

  const { classes } = useStyles()

  const [selectedFilter, setSelectedFilter] = useState<
    ReservationStatus | string
  >('')

  const threadStateFilter = router.query.threadState

  if (status === 'loading') return <VestaSpinnerOverlay visible={true} />
  if (status === 'error') return <p>Something went wrong.</p>

  const threads = data.filter((thread) => {
    if (threadStateFilter === 'unread')
      return thread.unreadMessageCount > 0 && thread.archived === false
    if (threadStateFilter === 'overdue')
      return (
        thread.enableReminder && thread.isOverdue && thread.archived === false
      )
    if (threadStateFilter === 'archived') return thread.archived === true
    if (threadStateFilter === 'all') return thread.archived === false
  })

  const shownThreads = threads.filter(({ status }) =>
    selectedFilter === '' ? true : status === selectedFilter
  )

  const emptyMessage = (
    <Center w="100%" sx={{ alignSelf: 'center' }}>
      <Text fz="xl" fw={600}>
        {shownThreads.length > 0
          ? 'Select a thread'
          : 'There are no messages to display, please try selecting a different filter. '}
      </Text>
    </Center>
  )

  return (
    <Box className="loading-spinner-container">
      <Title order={1} className={classes.header}>
        Messages
      </Title>
      <Space h="md" />
      <Flex
        mih={50}
        w="100%"
        gap={0}
        justify="flex-start"
        align="flex-start"
        direction="row"
        wrap="nowrap"
      >
        <ThreadList
          threads={shownThreads}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          onToggleRead={() => {
            void refetch()
            void refetchUnreadOverdue()
          }}
          onToggleArchived={() => {
            void refetch()
          }}
          onReminderDismissed={() => {
            void refetch()
            void refetchUnreadOverdue()
          }}
        />
        {children || emptyMessage}
      </Flex>
    </Box>
  )
}

export default MessagesLayout
