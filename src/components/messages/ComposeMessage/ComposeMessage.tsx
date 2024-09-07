import {
  createStyles,
  useMantineTheme,
  Flex,
  Image,
  Button,
  Textarea,
  Tooltip,
  Kbd,
  ActionIcon,
  Box,
  Modal,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useMediaQuery } from '@mantine/hooks'
import { useEffect, useState } from 'react'
import type { IMessageThread } from 'types/messages'
import { api } from 'utils/api'
import GptDialogue from '../GptDialogue/GptDialogue'

const useStyles = createStyles(() => ({
  newMessage: {
    overflow: 'hidden',
  },
  cannedButton: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}))

interface Props {
  threadId: string
  listingId: string
  onMessageSent: () => void
  onCannedMessageClick: () => void
  selectedCannedBody: string
  thread: IMessageThread
  disabled?: boolean
  disabledAI?: boolean
}

const ComposeMessage = ({
  threadId,
  listingId,
  onMessageSent,
  onCannedMessageClick,
  selectedCannedBody,
  thread,
  disabled,
  disabledAI,
}: Props) => {
  const { classes } = useStyles()
  const mutation = api.messages.createMessage.useMutation()
  const [newMessage, setNewMessage] = useState<string>('')
  const [canSend, setCanSend] = useState<boolean>(false)
  const [opened, { open, close }] = useDisclosure(false)
  const theme = useMantineTheme()
  const mobileView = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

  useEffect(() => {
    setNewMessage('')
  }, [threadId])

  useEffect(() => {
    setCanSend(!disabled && !!newMessage)
  }, [newMessage])

  const sendMessage = () => {
    if (newMessage === '') return
    mutation.mutate({
      messageThreadId: threadId,
      message: newMessage,
      user: 'PROPERTY_MANAGER',
    })
    setNewMessage('')
  }

  useEffect(() => {
    if (mutation.isSuccess) onMessageSent()
  }, [mutation.isSuccess])

  useEffect(() => {
    if (selectedCannedBody) setNewMessage(selectedCannedBody)
  }, [selectedCannedBody])

  const editBotResponse = (message: string) => {
    setNewMessage(message)
    close()
  }

  return (
    <Box style={{ flex: '0 0 auto' }}>
      <Modal
        opened={opened}
        onClose={close}
        closeOnClickOutside={false}
        title={'AI Assistant Dialogue'}
      >
        <GptDialogue
          editBotResponse={editBotResponse}
          listingId={listingId}
          thread={thread}
        />
      </Modal>
      <Flex
        w="100%"
        mih={50}
        gap="sm"
        justify="center"
        align={mobileView ? 'flex-end' : 'center'}
        direction={mobileView ? 'column' : 'row'}
        wrap="nowrap"
      >
        <ActionIcon size="lg" variant="transparent" disabled={disabledAI}>
          <Image src={'/icon-ai.svg'} alt="Open AI dialogue" onClick={open} />
        </ActionIcon>

        <Textarea
          className={classes.newMessage}
          w="100%"
          value={newMessage}
          onChange={(event) => setNewMessage(event.currentTarget.value)}
          autosize
          disabled={disabled}
          minRows={1}
          placeholder="Type your message here..."
          onKeyDown={(event) => {
            if (event.key === 'Enter' && event.ctrlKey == true) {
              setNewMessage(newMessage + '\n')
            } else if (event.key === 'Enter' && event.shiftKey == false) {
              event.preventDefault()
              sendMessage()
            }
          }}
        />
        <Flex gap="sm">
          <Box h={39} w={40} className={classes.cannedButton}>
            <ActionIcon size="lg" variant="transparent" disabled={disabled}>
              <Image
                fit="fill"
                src={'/icon-canned.svg'}
                alt="Send canned message"
                onClick={onCannedMessageClick}
              />
            </ActionIcon>
          </Box>
          <Tooltip label={<Kbd>Enter</Kbd>} color="white">
            <Button
              color="vesta"
              disabled={!canSend || disabled}
              onClick={() => sendMessage()}
            >
              Send
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  )
}
export default ComposeMessage
