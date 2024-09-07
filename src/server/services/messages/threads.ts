import type { IMessage } from 'types/messages'
import type { MessageUserType } from '../../../../prisma/generated/zod'
import { Channel } from '.prisma/client'
import type { MessageThread } from './types'

export const getMostRecentMessage = (messages: IMessage[]) => {
  const mostRecentMessage = messages.reduce((prev, current) =>
    prev.timestamp > current.timestamp ? prev : current
  )
  return mostRecentMessage
}

export const getMostRecentMessageByUser = (
  messages: IMessage[],
  user: MessageUserType
) => {
  const filteredMessages = messages.filter((message) => message.user === user)

  if (filteredMessages.length === 0) {
    return null
  }

  const mostRecentMessage = getMostRecentMessage(filteredMessages)
  return mostRecentMessage
}

export const isOverdue = (messages: IMessage[]): boolean => {
  if (messages.length === 0) return false

  const mostRecentPmMessage = getMostRecentMessageByUser(
    messages,
    'PROPERTY_MANAGER'
  )

  const oneHourAgo = new Date(new Date().setHours(new Date().getHours() - 1))
  if (!mostRecentPmMessage) {
    const mostRecentMessage = getMostRecentMessage(messages)
    return mostRecentMessage.timestamp > oneHourAgo
  } else {
    const newGuestMessages = messages.filter(
      (message) =>
        message.user === 'GUEST' &&
        message.timestamp > mostRecentPmMessage.timestamp
    )

    return newGuestMessages.some((message) => {
      return message.timestamp < oneHourAgo
    })
  }
}

export const disableSending = (thread: MessageThread): boolean => {
  switch (thread.channel) {
    case Channel.Direct:
      return !thread.guest.email
    default:
      return false
  }
}
