import { Fragment } from 'react'
import { OrganizationRole } from '@prisma/client'
import Link from 'next/link'
import { Button, Flex, Stack, Table, Text } from '@mantine/core'

import { formatPhoneNumberIntl } from 'react-phone-number-input'

interface User {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  organizationRole: string | null
  hasLogin: boolean
}

const PeopleTab = ({
  users,
  onInvite,
}: {
  users: User[]
  onInvite: (userId: string) => void
}) => {
  return (
    <>
      <Stack spacing="xxxs">
        <Flex justify="space-between">
          <Text fz="lg" fw="bold">
            People
          </Text>
          <Link href="/admin/add-user">
            <Button>Add a member</Button>
          </Link>
        </Flex>
        <Text c="gray">Here you can manage people in your organization</Text>
      </Stack>
      <Table verticalSpacing="md">
        <tbody>
          {users.map((user) => (
            <Fragment key={user.id}>
              <UserRow user={user} onInvite={onInvite} />
            </Fragment>
          ))}
        </tbody>
      </Table>
    </>
  )
}

const UserRow = ({
  user: { id, name, email, phone, organizationRole, hasLogin },
  onInvite,
}: {
  user: User
  onInvite: (userId: string) => void
}) => {
  return (
    <tr>
      <td>
        <Text fw="bold">{name}</Text>
      </td>
      <td>
        <Text>{email}</Text>
      </td>
      <td>
        <Text>{formatPhoneNumberIntl(phone ?? '')}</Text>
      </td>
      <td>
        {organizationRole === OrganizationRole.PROPERTY_MANAGER
          ? 'Property manager'
          : organizationRole === OrganizationRole.PROPERTY_OWNER
          ? 'Property owner'
          : 'Admin'}
      </td>
      <td>
        <Button
          variant="outline"
          size="sm"
          disabled={hasLogin}
          onClick={() => onInvite(id)}
        >
          Invite
        </Button>
      </td>
    </tr>
  )
}

export default PeopleTab
