import { createStyles, Flex, Text, Tooltip } from '@mantine/core'
import { DateTime } from 'luxon'

const useStyles = createStyles((theme) => ({
  scheduledMessage: {
    backgroundColor: theme.colors.gray[1],
    borderRadius: 8,
    padding: '4px 8px',
  },
  scheduledMessageTitle: {
    fontWeight: 600,
    fontSize: '14px',
  },
  error: {
    backgroundColor: theme.colors.red[1],
  },
}))

interface Props {
  message: { title: string; scheduledAt: Date; status: string }
  timeZone: string
  key: number
}

const ScheduledMessage = ({ message, timeZone }: Props) => {
  const { classes, cx } = useStyles()

  const formatScheduledMessageDate = (date: Date) => {
    return DateTime.fromJSDate(date).setZone(timeZone).toLocaleString({
      month: 'short',
      day: 'numeric',
    })
  }

  const formatScheduledMessageDateTitle = (date: Date) => {
    return DateTime.fromJSDate(date).setZone(timeZone).toLocaleString({
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  }

  return (
    <Flex
      direction={'row'}
      justify={'space-between'}
      w={'100%'}
      className={cx(
        classes.scheduledMessage,
        message.status === 'FAILED' ? classes.error : ''
      )}
    >
      <Text className={classes.scheduledMessageTitle}>{message.title}</Text>
      <Tooltip label={formatScheduledMessageDateTitle(message.scheduledAt)}>
        <Text>
          {formatScheduledMessageDate(message.scheduledAt)} (
          {message.status.toLowerCase()})
        </Text>
      </Tooltip>
    </Flex>
  )
}
export default ScheduledMessage
