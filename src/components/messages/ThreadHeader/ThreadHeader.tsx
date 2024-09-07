import React from 'react'
import {
  createStyles,
  useMantineTheme,
  Flex,
  Text,
  Group,
  Avatar,
  Stack,
  ActionIcon,
  Button,
  Space,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import MailtoLink from 'components/common/MailtoLink/MailtoLink'
import type { IMessageThread } from 'types/messages'
import { IconChevronLeft, IconInfoCircle } from '@tabler/icons-react'
import Link from 'next/link'
import { formatPhoneNumberIntl } from 'react-phone-number-input'

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: 28,
    fontWeight: 900,
    lineHeight: 1.3,
    marginBottom: -16,
  },
  info: {
    fontWeight: 500,
    lineHeight: 1.4,
    color: theme.colors.gray[6],
  },
  mailtoLink: {
    color: 'inherit',
    textDecoration: 'inherit',
  },
}))
interface Props {
  thread: IMessageThread
  showTripToggle: boolean
  onTripClick: () => void
}

const ThreadHeader = ({ thread, showTripToggle, onTripClick }: Props) => {
  const { classes } = useStyles()
  const theme = useMantineTheme()
  const mobileView = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

  return (
    <>
      <Group position="apart">
        <Flex gap={{ base: 'xs', sm: 'md' }}>
          {mobileView && (
            <Link href="/messages/all">
              <ActionIcon color="neutral">
                <IconChevronLeft size={20} />
              </ActionIcon>
            </Link>
          )}
          <Avatar
            src={null}
            alt="no image here"
            color="vesta"
            size={mobileView ? 'md' : 'lg'}
          />
          <Stack>
            <Text className={classes.title}>{thread.guestName}</Text>
            <Flex wrap="wrap">
              {mobileView ? (
                <Text className={classes.info}>{thread.listing.name}</Text>
              ) : (
                <>
                  <Text className={classes.info}>
                    {thread.guestEmail && !mobileView && (
                      <MailtoLink>{thread.guestEmail}</MailtoLink>
                    )}
                  </Text>
                  <Space w="xs" />
                  <Text className={classes.info}>
                    {thread.guestPhone &&
                      !mobileView &&
                      formatPhoneNumberIntl(thread.guestPhone)}
                  </Text>
                </>
              )}
            </Flex>
          </Stack>
        </Flex>

        {mobileView && (
          <ActionIcon
            color="neutral"
            onClick={onTripClick}
            style={{ alignSelf: 'flex-start' }}
          >
            <IconInfoCircle size={20} />
          </ActionIcon>
        )}
        {showTripToggle && !mobileView && (
          <Button
            variant="subtle"
            color="neutral"
            rightIcon={<IconInfoCircle size={20} />}
            onClick={onTripClick}
            disabled={!thread.calendarEventId}
          >
            Trip info
          </Button>
        )}
      </Group>
    </>
  )
}

export default ThreadHeader
