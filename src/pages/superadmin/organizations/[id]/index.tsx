import { type NextPage } from 'next'
import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'
import { api } from 'utils/api'
import { useRouter } from 'next/router'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import {
  Button,
  Group,
  List,
  Space,
  Stack,
  Text,
  Title,
  createStyles,
} from '@mantine/core'
import { formatAddress } from 'utils/vesta'
import { showNotification } from '@mantine/notifications'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { GlobalRole, OrganizationRole } from '@prisma/client'

const useStyles = createStyles(() => ({
  label: {
    fontWeight: 700,
  },
}))

const View: NextPage = () => {
  const router = useRouter()
  const { classes } = useStyles()
  const mutation = api.organizations.connectToBookingPal.useMutation()

  const organizationId = String(router.query.id)
  const organization = api.organizations.getOne.useQuery(
    {
      id: organizationId,
    },
    { enabled: organizationId !== 'undefined' }
  )

  const [owners, setOwners] = useState<
    {
      id: string
      name: string | null
      email: string | null
      emailVerified: Date | null
      image: string | null
      phone: string | null
      globalRole: GlobalRole
      organizationId: string | null
      organizationRole: OrganizationRole | null
    }[]
  >([])

  useEffect(() => {
    if (mutation.isSuccess) {
      void organization.refetch()
      showNotification({
        title: 'Booking Pal update!',
        message: '',
        color: 'teal',
      })
    }
  }, [mutation.isSuccess])

  useEffect(() => {
    if (mutation.isError) {
      showNotification({
        title: 'Booking Pal connection failed',
        message: mutation.error.message,
        color: 'red',
      })
    }
  }, [mutation.isError])

  useEffect(() => {
    if (organization.data) {
      const owners = organization.data.users
        .filter((user) => user.organizationRole === 'PROPERTY_OWNER')
        .sort((a, b) => ((a.name ?? '') > (b.name ?? '') ? 1 : -1))
      setOwners(owners ? owners : [])
    }
  }, [organization.data])

  return (
    <>
      <Breadcrumbs
        links={[
          { title: 'Super admin', href: '/superadmin/' },
          { title: 'Organizations', href: '/superadmin/organizations' },
          { title: organization?.data?.name ?? '' },
        ]}
      />
      <VestaSpinnerOverlay
        visible={organization.isLoading || mutation.isLoading}
      />

      {organization?.data && (
        <>
          <Space h="lg" />
          <Stack spacing="md">
            <Stack spacing="xs">
              <Text className={classes.label}>Organization admin: </Text>
              <Text>{organization.data.adminName}</Text>
            </Stack>
            <Stack spacing="xs">
              <Text className={classes.label}>Address: </Text>
              <Text>{formatAddress(organization.data)}</Text>
            </Stack>
            {organization.data?.bookingPalConnection && (
              <Stack spacing="xs">
                <Group>
                  <Text className={classes.label}>
                    BookingPal connection ID:{' '}
                  </Text>
                  <Text>
                    {organization.data.bookingPalConnection.companyId}
                  </Text>
                </Group>
                <Button
                  component="a"
                  href={`/superadmin/organizations/wizard/${organizationId}#hidenav`}
                  target="_blank"
                  w={250}
                >
                  Open wizard
                </Button>
              </Stack>
            )}

            {!organization.data?.bookingPalConnection && (
              <Group pt={20}>
                <Button
                  onClick={() => {
                    mutation.mutate({ id: organizationId })
                  }}
                >
                  Push to BookingPal
                </Button>
              </Group>
            )}

            <Title order={1}>Manual actions</Title>
            <Stack>
              <Link
                href={`/superadmin/organizations/${organizationId}/reservation`}
              >
                Add manual Airbnb reservation
              </Link>
            </Stack>
            <Title order={1}>Owners</Title>
            <List>
              {owners ? (
                owners.map((owner) => (
                  <List.Item key={owner.id}>
                    <Link href={`/superadmin/owners/${owner.id}`}>
                      {owner.name}
                    </Link>
                  </List.Item>
                ))
              ) : (
                <>No owners</>
              )}
            </List>
          </Stack>
        </>
      )}
    </>
  )
}

export default View
