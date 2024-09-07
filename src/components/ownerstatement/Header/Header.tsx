import {
  Stack,
  Text,
  Flex,
  Space,
  Button,
  ActionIcon,
  Badge,
  Image,
  Group,
} from '@mantine/core'
import { api } from 'utils/api'
import InlineAddress from 'components/common/InlineAddress'
import { useIsPrintable } from 'utils/hooks'
import { IconLock } from '@tabler/icons-react'
import { showNotification } from '@mantine/notifications'
import { DateTime } from 'luxon'

interface Props {
  onLocked?: () => void | null
  isLocked: boolean
  month: number
  year: number
  ownerPortal: boolean
  listing: {
    id: string
    name: string
    line1: string
    line2: string | null
    city: string
    state: string
    zip: string
    country: string
    propertyOwner: {
      ownerEntity: string | null
      name: string | null
    } | null
  }
}

const StatementHeader = ({
  onLocked,
  isLocked,
  month,
  year,
  ownerPortal,
  listing,
}: Props) => {
  const isPrintable = useIsPrintable()

  const mutation = api.ownerStatements.lockStatement.useMutation()

  const { data: orgData } = api.organizations.getCurrent.useQuery()

  return (
    <>
      <Stack>
        {listing && (
          <>
            <Flex justify="space-between">
              <Flex gap="md">
                <Text fz="xl" fw="bold">
                  {`${DateTime.fromObject({ month, year }).monthLong} ${year}`}{' '}
                  Statement
                </Text>
                {!isLocked && (
                  <Badge size="xl" variant="filled" color="orange">
                    draft
                  </Badge>
                )}
              </Flex>
              <Flex gap="sm">
                {!isPrintable && (
                  <Button
                    size="sm"
                    onClick={() =>
                      window.open(`${window.location.href}#printable`, '_blank')
                    }
                  >
                    Download as PDF
                  </Button>
                )}
                {!ownerPortal && (
                  <ActionIcon
                    onClick={() =>
                      mutation.mutate(
                        { listingId: listing.id, month, year },
                        {
                          onSuccess: () => {
                            if (onLocked) onLocked()
                            showNotification({
                              title: '',
                              message: 'Statement locked!',
                              color: 'teal',
                            })
                          },
                        }
                      )
                    }
                    disabled={isLocked}
                    variant="outline"
                    color="vesta"
                    h={36}
                    w={36}
                  >
                    <IconLock size={18} />
                  </ActionIcon>
                )}
              </Flex>
            </Flex>
            <Group>
              {orgData?.logoUrl && (
                <Image
                  maw={100}
                  src={orgData?.logoUrl || ''}
                  alt={`${orgData?.name || 'Company'} logo`}
                />
              )}
              <Stack spacing="xs">
                <Flex gap="xs">
                  <Text fz="md" fw="bold">
                    Property owner:{' '}
                  </Text>
                  <Text fz="md">
                {listing.propertyOwner?.ownerEntity &&
                listing.propertyOwner?.name
                  ? `${listing.propertyOwner?.ownerEntity} (${listing.propertyOwner?.name})`
                  : listing.propertyOwner?.name}
                  </Text>
                </Flex>
                <Flex gap="xs">
                  <Text fz="md" fw="bold">
                    Property info:{' '}
                  </Text>
              <Text fz="md">{listing.name} - </Text>
              <InlineAddress address={listing} size="md" />
                </Flex>
              </Stack>
            </Group>
          </>
        )}
      </Stack>
      <Space h="xs" />
    </>
  )
}

export default StatementHeader
