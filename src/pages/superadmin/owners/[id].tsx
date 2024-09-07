import { type NextPage } from 'next'
import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'
import { api } from 'utils/api'
import { useRouter } from 'next/router'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import { Button, Group, Space, Stack, Text, createStyles } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { useEffect } from 'react'

const useStyles = createStyles(() => ({
  label: {
    fontWeight: 700,
  },
}))

const View: NextPage = () => {
  const router = useRouter()
  const { classes } = useStyles()
  const mutation = api.user.connectToBookingPal.useMutation()

  const ownerId = String(router.query.id)
  const user = api.user.getOne.useQuery(
    {
      id: ownerId,
    },
    {
      enabled: ownerId !== 'undefined',
    }
  )

  useEffect(() => {
    if (mutation.isSuccess) {
      void user.refetch()
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

  return (
    <>
      <Breadcrumbs
        links={[
          { title: 'Super admin', href: '/superadmin/' },
          { title: 'Organizations', href: '/superadmin/organizations' },
          {
            title: user?.data?.organization?.name ?? '',
            href: `/superadmin/organizations/${
              user?.data?.organizationId ?? ''
            }`,
          },
          { title: user?.data?.name ?? '' },
        ]}
      />
      <VestaSpinnerOverlay visible={user.isLoading || mutation.isLoading} />

      {user?.data && (
        <>
          <Space h="lg" />
          <Stack spacing="md">
            <Stack spacing="xs">
              <Text className={classes.label}>Name: </Text>
              <Text>{user.data.name}</Text>
            </Stack>
            <Stack spacing="xs">
              <Text className={classes.label}>Email: </Text>
              <Text>{user.data.email}</Text>
            </Stack>

            {user.data?.bookingPalConnection && (
              <Stack spacing="xs">
                <Group>
                  <Text className={classes.label}>
                    BookingPal connection ID:{' '}
                  </Text>
                  <Text>{user.data.bookingPalConnection.companyId}</Text>
                </Group>
                <Button
                  component="a"
                  href={`/superadmin/owners/wizard/${ownerId}#hidenav`}
                  target="_blank"
                  w={250}
                >
                  Open wizard
                </Button>
              </Stack>
            )}

            {!user.data?.bookingPalConnection && (
              <Group pt={20}>
                <Button
                  onClick={() => {
                    mutation.mutate({ id: ownerId })
                  }}
                >
                  Push to BookingPal
                </Button>
              </Group>
            )}
          </Stack>
        </>
      )}
    </>
  )
}

export default View
