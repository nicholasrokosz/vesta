import {
  Button,
  Center,
  CopyButton,
  Divider,
  Grid,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import type { ListingWithDirectBookingKey } from 'types/listings'
import { api } from 'utils/api'

const DirectBookingTab = () => {
  const { data: directBookingEnabled, refetch } =
    api.organizations.getDirectBookingStatus.useQuery()

  const { data: listings } =
    api.listing.getListingsWithDirectBookingKeys.useQuery(undefined, {
      enabled: !!directBookingEnabled,
    })

  const { mutate: enableDirectBooking } =
    api.organizations.enableDirectBooking.useMutation()

  return (
    <>
      {directBookingEnabled ? (
        <Stack>
          {listings &&
            listings.map((listing) => (
              <ListingRow key={listing.id} listing={listing} />
            ))}
        </Stack>
      ) : (
        <Center pt="xxxl">
          <Stack align={'center'} w={600}>
            <Title order={2}>
              {/* eslint-disable-next-line */}
              Your organization hasn't enabled direct booking yet
            </Title>
            <Button
              onClick={() =>
                enableDirectBooking(undefined, {
                  onSuccess: () => {
                    showNotification({
                      title: 'Success!',
                      message: 'Direct booking has been enabled',
                      color: 'teal',
                    })
                    void refetch()
                  },
                })
              }
            >
              Enable direct booking
            </Button>
          </Stack>
        </Center>
      )}
    </>
  )
}

const ListingRow = ({ listing }: { listing: ListingWithDirectBookingKey }) => (
  <>
    <Grid align="center">
      <Grid.Col span={4}>
        <Text fw="bold">{listing.name}</Text>
      </Grid.Col>
      <Grid.Col span={1}>
        <CopyButton
          value={`<iframe src="${listing.widgetUrl}" width="330px" height="580px" frameborder="0" ></iframe>`}
        >
          {({ copied, copy }) => (
            <Button
              size="sm"
              onClick={copy}
              leftIcon={copied ? <IconCheck /> : <IconCopy />}
              variant="subtle"
              color="gray.9"
              fz="sm"
            >
              Copy iframe code
            </Button>
          )}
        </CopyButton>
      </Grid.Col>
    </Grid>
    <Divider my="xs" />
  </>
)

export default DirectBookingTab
