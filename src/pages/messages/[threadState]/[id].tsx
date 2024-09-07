import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useMantineTheme, Stack, Divider, Flex, Modal } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'

import { api } from 'utils/api'
import {
  CannedMessageModal,
  MessageThread,
  TripPanel,
  ThreadHeader,
  ComposeMessage,
  MessagesLayout,
} from 'components/messages'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import VestaModal from 'components/common/Modal/Modal'

const MessagesPage = () => {
  const router = useRouter()

  const [showTripPanel, setShowTripPanel] = useState<boolean>(true)
  const [showCannedMessageModal, setShowCannedMessageModal] =
    useState<boolean>(false)
  const [selectedCannedBody, setSelectedCannedBody] = useState<string>('')
  const theme = useMantineTheme()
  const mobileView = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

  const selectedThreadId = router.query.id as string

  const toggleTripPanel = () => {
    if (showTripPanel) {
      setShowTripPanel(false)
    } else {
      setShowTripPanel(true)
    }
  }

  useEffect(() => {
    if (mobileView) setShowTripPanel(false)
  }, [mobileView])

  const {
    data: selectedThread,
    status: messagesStatus,
    refetch: refetchMessages,
  } = api.messages.getOne.useQuery(
    {
      id: selectedThreadId,
    },
    {
      enabled: !!selectedThreadId,
    }
  )

  // TODO: Move automations data fetch into another component
  const { data: automationsData } = api.automations.getCanned.useQuery(
    {
      messageThreadId: selectedThreadId,
    },
    {
      enabled: !!selectedThreadId,
    }
  )

  const onDataUpdated = () => {
    void refetchMessages()
  }

  if (messagesStatus === 'loading')
    return <VestaSpinnerOverlay visible={true} />
  if (messagesStatus === 'error') return <p>Something went wrong.</p>

  const messageThread = (
    <>
      <VestaModal
        opened={showCannedMessageModal}
        onClose={() => setShowCannedMessageModal(false)}
        title="Send canned message"
        size={761}
      >
        <CannedMessageModal
          automations={automationsData}
          onSelected={(body) => {
            setSelectedCannedBody(body)
            setShowCannedMessageModal(false)
          }}
        />
      </VestaModal>

      <Stack
        w="100%"
        h="calc(100vh - 80px)" // HACK: Remove after messaging frontend overhaul
        px={{ base: 'xs', sm: 'md' }}
      >
        <ThreadHeader
          thread={selectedThread}
          showTripToggle={!showTripPanel}
          onTripClick={() => toggleTripPanel()}
        />
        <Divider size="xs" />
        <MessageThread
          thread={selectedThread}
          onMarkAsRead={onDataUpdated}
          onEmailChange={onDataUpdated}
        />
        <ComposeMessage
          threadId={selectedThread.id}
          listingId={selectedThread.listing.id}
          onMessageSent={onDataUpdated}
          onCannedMessageClick={() => setShowCannedMessageModal(true)}
          selectedCannedBody={selectedCannedBody}
          thread={selectedThread}
          disabled={selectedThread.disableSending}
          disabledAI={
            !!!selectedThread.messages.filter((m) => m.user === 'GUEST')
              .length || selectedThread.disableSending
          }
        />
      </Stack>
      {selectedThread.calendarEventId &&
        showTripPanel &&
        (mobileView ? (
          <Modal
            opened={showTripPanel}
            onClose={() => setShowTripPanel(false)}
            styles={{ body: { padding: 0 } }}
            title="Trip info"
            fullScreen
          >
            <Flex>
              <TripPanel
                eventId={selectedThread.calendarEventId}
                listingId={selectedThread.listing.id}
                onClose={() => toggleTripPanel()}
              />
            </Flex>
          </Modal>
        ) : (
          <Flex miw={394}>
            <TripPanel
              eventId={selectedThread.calendarEventId}
              listingId={selectedThread.listing.id}
              onClose={() => toggleTripPanel()}
            />
          </Flex>
        ))}
    </>
  )

  return mobileView ? (
    messageThread
  ) : (
    <MessagesLayout>{messageThread}</MessagesLayout>
  )
}

export default MessagesPage
