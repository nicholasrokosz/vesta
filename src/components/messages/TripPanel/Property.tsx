import { useState, useEffect } from 'react'
import {
  Title,
  Flex,
  Image,
  createStyles,
  Divider,
  Textarea,
  Stack,
  CopyButton,
  ActionIcon,
  Text,
} from '@mantine/core'
import { IconCopy, IconCheck } from '@tabler/icons-react'

import type { ICalendarEvent } from 'types/calendar'
import { api } from 'utils/api'

const useStyles = createStyles((theme) => ({
  address: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.gray[9],
    opacity: 0.5,
  },
  icon: {
    color: theme.colors.gray[6],
  },
  copy: {
    fontWeight: 600,
    color: theme.colors.gray[6],
  },
}))

interface Props {
  event: ICalendarEvent
}

enum SaveStatus {
  SAVING,
  SAVED,
  IDLE,
}

const Property = ({ event }: Props) => {
  const { classes } = useStyles()
  const mutation = api.listing.upsertNotes.useMutation()
  const [notes, setNotes] = useState(event.listingNotes)
  const [lastNotes, setLastNotes] = useState(event.listingNotes)
  const [status, setStatus] = useState(SaveStatus.IDLE)

  useEffect(() => {
    setStatus(SaveStatus.IDLE)
    setNotes(event.listingNotes)
    setLastNotes(event.listingNotes)
  }, [event.listingId])

  const saveNotes = () => {
    if (notes !== lastNotes) {
      mutation.mutate({
        listingId: event.listingId,
        notes: notes || '',
      })
      setLastNotes(notes)
      setStatus(SaveStatus.SAVED)
    }
  }

  return (
    <Flex direction={'column'} justify={'flex-start'} px="lg" pt={0} pb={100}>
      <Image
        src={event.listingPhoto}
        alt={event.listingName}
        pb="sm"
        width={'100%'}
        radius={'sm'}
      />
      <Flex direction="column" gap="mid">
        <Flex direction={'row'} justify={'flex-start'} pb="md" wrap="wrap">
          <Flex direction={'column'} w={'100%'} bgr={'cyan'}>
            <Title lineClamp={2} order={5}>
              {event.listingName}
            </Title>
            <span className={classes.address}>Owner: {event.listingOwner}</span>
            <span className={classes.address}>
              {event.listingUnitType} • {event.listingAddress}
            </span>
          </Flex>
        </Flex>
        {event.listingWifiName && event.listingWifiPassword && (
          <>
            <Stack spacing={'xs'} pt={15}>
              <Flex direction={'row'} justify={'space-between'} fz="sm">
                <span className={classes.address}>WiFi name</span>
                <span>{event.listingWifiName}</span>
              </Flex>
              <Flex direction={'row'} justify={'space-between'} fz="sm">
                <span className={classes.address}>WiFi password</span>
                <span>{event.listingWifiPassword}</span>
              </Flex>
              <CopyButton
                value={`WiFi name: ${event.listingWifiName}, WiFi password: ${event.listingWifiPassword}`}
              >
                {({ copied, copy }) => (
                  <Flex
                    direction={'row'}
                    justify={'flex-start'}
                    align={'center'}
                  >
                    <ActionIcon onClick={copy} className={classes.icon}>
                      {copied ? (
                        <IconCheck size="1.25rem" />
                      ) : (
                        <IconCopy size="1.25rem" />
                      )}
                    </ActionIcon>
                    <span className={classes.copy}>Copy WiFi details</span>
                  </Flex>
                )}
              </CopyButton>
            </Stack>
          </>
        )}

        {event.listingDoorCode && (
          <>
            <Divider size={'xs'} my="lg" />
            <Stack spacing={'xs'}>
              <Flex direction={'row'} justify={'space-between'} fz="sm">
                <span className={classes.address}>Smart lock door code</span>
                <span>{event.listingDoorCode}</span>
              </Flex>
              <CopyButton value={event.listingDoorCode}>
                {({ copied, copy }) => (
                  <Flex
                    direction={'row'}
                    justify={'flex-start'}
                    align={'center'}
                  >
                    <ActionIcon onClick={copy} className={classes.icon}>
                      {copied ? (
                        <IconCheck size="1.25rem" />
                      ) : (
                        <IconCopy size="1.25rem" />
                      )}
                    </ActionIcon>
                    <span className={classes.copy}>Copy door code</span>
                  </Flex>
                )}
              </CopyButton>
            </Stack>
          </>
        )}

        <Divider size={'xs'} my="lg" />

        <Textarea
          w={'100%'}
          autosize
          minRows={2}
          label={
            <Flex direction={'row'} justify={'space-between'}>
              <Title order={6} mb="md">
                Property notes
              </Title>
              {status === SaveStatus.SAVING && (
                <Text className={classes.address} fz="xs">
                  saving...
                </Text>
              )}
              {status === SaveStatus.SAVED && (
                <Text className={classes.address} fz="xs">
                  saved!
                </Text>
              )}
            </Flex>
          }
          value={notes}
          onChange={(e) => {
            setStatus(SaveStatus.SAVING)
            setNotes(e.currentTarget.value)
          }}
          onBlur={saveNotes}
        />
      </Flex>
    </Flex>
  )
}

export default Property
