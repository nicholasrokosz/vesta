import React, { useRef, useEffect } from 'react'
import {
  Divider,
  Box,
  Text,
  createStyles,
  Stack,
  TextInput,
  Button,
} from '@mantine/core'
import type { IMessageThread } from 'types/messages'
import { DateTime } from 'luxon'
import { Message } from 'components/messages'
import { api } from 'utils/api'
import { useRouter } from 'next/router'
import { checkMessageGap } from 'utils/messages'
import { validateEmail } from 'utils/vesta'
import { useValidatedState } from '@mantine/hooks'

const useStyles = createStyles(() => ({
  scrollArea: {
    flex: '1 1 auto',
    overflow: 'auto',
  },
}))

interface Props {
  thread: IMessageThread
  onMarkAsRead: () => void
  onEmailChange: () => void
}

const MessageThread = ({ thread, onMarkAsRead, onEmailChange }: Props) => {
  const { classes } = useStyles()
  const router = useRouter()
  const scrollArea = useRef<HTMLDivElement>(null)
  const markAsReadMutation =
    api.messages.updateMessageThreadReadStatus.useMutation()
  const [{ value: email, valid: emailValid }, setEmail] = useValidatedState(
    '',
    (value) => value === '' || validateEmail(value)
  )

  const updateGuestEmailMutation = api.guest.updateEmail.useMutation()

  const formatDate = (date: Date) =>
    DateTime.fromISO(date.toISOString()).toLocaleString({
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })

  useEffect(() => {
    scrollArea.current?.scrollTo({
      top: scrollArea.current?.scrollHeight,
    })

    const handleRouteChange = () =>
      markAsReadMutation.mutate({ id: thread.id, read: true })
    if (thread.unreadMessageCount > 0) {
      router.events.on('routeChangeStart', handleRouteChange)
    }

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [thread])

  useEffect(() => {
    if (updateGuestEmailMutation.isSuccess) onEmailChange()
  }, [updateGuestEmailMutation])

  useEffect(() => {
    if (thread.unreadMessageCount > 0 && markAsReadMutation.isSuccess)
      onMarkAsRead()
  }, [markAsReadMutation])

  const needsDivider = (i: number) =>
    i === 0 || checkMessageGap(thread.messages[i], thread.messages[i - 1])

  return (
    <Box className={classes.scrollArea} ref={scrollArea}>
      {thread.messages.length > 0 ? (
        thread.messages.map(({ message, id, user, timestamp }, index) => (
          <React.Fragment key={id}>
            {!!needsDivider(index) && (
              <Divider
                my="md"
                variant="dashed"
                labelPosition="center"
                label={formatDate(timestamp)}
              />
            )}
            <Message text={message} sender={user} />
          </React.Fragment>
        ))
      ) : thread.guestEmail ? (
        <Text align="center">No messages, send one below</Text>
      ) : (
        <Stack align="center">
          <Text align="center">
            Please enter an email address for this guest to start sending
            messages
          </Text>

          <TextInput
            w="50%"
            placeholder="Enter guest email"
            onChange={(event) => setEmail(event.currentTarget.value)}
          />
          <Button
            w="50%"
            disabled={!emailValid}
            onClick={() => {
              updateGuestEmailMutation.mutate({
                threadId: thread.id,
                email: email,
              })
            }}
          >
            Save
          </Button>
        </Stack>
      )}
    </Box>
  )
}

export default MessageThread
