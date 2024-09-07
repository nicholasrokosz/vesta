import { Stack, Tabs, Text } from '@mantine/core'
import PeopleTab from 'components/admin/people'
import PlaidTab from 'components/admin/plaid'
import StripeTab from 'components/admin/stripe'
import DirectBookingTab from 'components/admin/directBooking'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import { api } from 'utils/api'
import { showNotification } from '@mantine/notifications'
import { useRouter } from 'next/router'

const AdminPage = () => {
  const router = useRouter()

  const { data: orgData, isLoading: orgIsLoading } =
    api.organizations.getCurrent.useQuery()
  const {
    data: userData,
    isLoading: userDataIsLoading,
    refetch: refetchUserData,
  } = api.user.getAllCustomersInOrg.useQuery()

  const createUserLoginMutation = api.user.createUserLogin.useMutation()

  const inviteUser = (userId: string) => {
    createUserLoginMutation.mutate(
      { id: userId },
      {
        onSuccess: () => {
          showNotification({
            title: 'Success!',
            message: 'Member has been invited',
            color: 'teal',
          })
          void refetchUserData()
        },
        onError: () =>
          showNotification({
            title: 'Error',
            message: 'Something went wrong when inviting the member',
            color: 'red',
          }),
      }
    )
  }

  return (
    <Stack spacing="lg" className="loading-spinner-container" maw={900}>
      <VestaSpinnerOverlay visible={orgIsLoading || userDataIsLoading} />
      <Text fz="lg" fw="bold">
        Admin
      </Text>
      <Text fz="xl" fw="bold">
        {orgData?.name}
      </Text>
      <Tabs
        defaultValue="people"
        keepMounted={false}
        value={router.query.activeTab as string}
        onTabChange={(value) => void router.push(`/admin/${value || ''}`)}
      >
        <Tabs.List mb="lg">
          <Tabs.Tab fw="bold" value="people">
            People
          </Tabs.Tab>
          <Tabs.Tab fw="bold" value="plaid">
            Plaid
          </Tabs.Tab>
          <Tabs.Tab fw="bold" value="stripe">
            Stripe
          </Tabs.Tab>
          <Tabs.Tab fw="bold" value="directBooking">
            Direct booking
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="people">
          {userData && <PeopleTab users={userData} onInvite={inviteUser} />}
        </Tabs.Panel>
        <Tabs.Panel value="plaid">
          <PlaidTab />
        </Tabs.Panel>
        <Tabs.Panel value="stripe">
          <StripeTab />
        </Tabs.Panel>
        <Tabs.Panel value="directBooking">
          <DirectBookingTab />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  )
}

export default AdminPage
