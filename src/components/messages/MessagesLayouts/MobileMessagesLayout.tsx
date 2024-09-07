import { useState } from 'react'
import { createStyles, Title, Space, Flex, Box } from '@mantine/core'
import { ThreadList } from 'components/messages'
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

const MobileMessagesLayout = () => {
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
      return thread.isOverdue && thread.archived === false
    if (threadStateFilter === 'archived') return thread.archived === true
    if (threadStateFilter === 'all') return thread.archived === false
  })

  const shownThreads = threads.filter(({ status }) =>
    selectedFilter === '' ? true : status === selectedFilter
  )

  return (
    <Box className="loading-spinner-container" h="100%">
      <Title order={1} className={classes.header}>
        Messages
      </Title>
      <Space h="md" />
      <Flex
        mih={50}
        h={'calc(100% - 50px)'}
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
      </Flex>
    </Box>
  )
}

export default MobileMessagesLayout
