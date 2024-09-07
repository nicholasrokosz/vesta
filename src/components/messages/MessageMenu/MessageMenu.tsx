import { ActionIcon, Menu } from '@mantine/core'
import { IconDotsVertical } from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { api } from 'utils/api'

interface Props {
  enableMarkAsRead: boolean
  enableDismissReminder: boolean
  read: boolean
  archived: boolean
  threadId: string
  onToggleRead: () => void
  onToggleArchived: () => void
  onReminderDismissed: () => void
}

const MessageMenu = ({
  enableMarkAsRead,
  enableDismissReminder,
  read,
  archived,
  threadId,
  onToggleRead,
  onToggleArchived,
  onReminderDismissed,
}: Props) => {
  const [opened, setOpened] = useState(false)

  const markAsReadMutation =
    api.messages.updateMessageThreadReadStatus.useMutation()

  const markAsArchivedMutation =
    api.messages.updateMessageThreadArchivedStatus.useMutation()

  const dismissReminderMutation =
    api.messages.dismissMessageThreadReminder.useMutation()

  useEffect(() => {
    if (markAsReadMutation.isSuccess) onToggleRead()
  }, [markAsReadMutation])

  useEffect(() => {
    if (markAsArchivedMutation.isSuccess) onToggleArchived()
  }, [markAsArchivedMutation])

  useEffect(() => {
    if (dismissReminderMutation.isSuccess) onReminderDismissed()
  }, [dismissReminderMutation])

  return (
    <>
      <Menu shadow="md" opened={opened} onChange={setOpened}>
        <Menu.Target>
          <ActionIcon
            variant="transparent"
            onClick={(e) => {
              e.preventDefault()
              setOpened(true)
            }}
            w={10}
          >
            <IconDotsVertical size="1rem" />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            onClick={(e) => {
              e.preventDefault()
              markAsArchivedMutation.mutate({
                id: threadId,
                archived: !archived,
              })
            }}
          >
            {archived ? 'Move to inbox' : 'Archive'}
          </Menu.Item>
          {enableMarkAsRead && (
            <>
              <Menu.Item
                onClick={(e) => {
                  e.preventDefault()
                  markAsReadMutation.mutate({ id: threadId, read: !read })
                }}
              >
                Mark as {read ? 'unread' : 'read'}
              </Menu.Item>
            </>
          )}
          {enableDismissReminder && (
            <Menu.Item
              onClick={(e) => {
                e.preventDefault()
                dismissReminderMutation.mutate({
                  id: threadId,
                })
              }}
            >
              Dismiss reminder
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>
    </>
  )
}

export default MessageMenu
