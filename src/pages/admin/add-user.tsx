import { Button, Select, Stack, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { api } from 'utils/api'
import { validateEmail } from 'utils/vesta'
import { showNotification } from '@mantine/notifications'
import { useRouter } from 'next/router'
import { OrganizationRole } from '@prisma/client'
import { useEffect, useState } from 'react'
import InternationalPhoneInput from 'components/common/InternationalPhoneInput/InternationalPhoneInput'
import { isValidPhoneNumber } from 'react-phone-number-input'

const AddOwnerPage = () => {
  const router = useRouter()
  const [phoneRequired, setPhoneRequired] = useState<boolean>(false)

  const users = api.user.getAllCustomersInOrg.useQuery()
  const createUserMutation = api.user.createUser.useMutation()

  const emailIsUnique = (email: string) => {
    const allEmails =
      users.data?.map((user) => user.email?.toLowerCase() ?? '') || []
    return !allEmails.includes(email.toLowerCase())
  }

  const form = useForm({
    initialValues: {
      name: '',
      phone: '',
      email: '',
      organizationRole: OrganizationRole.PROPERTY_OWNER,
    },
    validate: {
      name: (value) => (value.length > 0 ? null : 'Name is required'),
      email: (value) =>
        emailIsUnique(value)
          ? validateEmail(value)
            ? null
            : 'Invalid email'
          : 'Email is already in use',
      phone: (value) => {
        if (phoneRequired && !value) return 'Phone is required'
        if (value) return isValidPhoneNumber(value) ? null : 'Invalid phone'
      },
      organizationRole: (value) =>
        value.length > 0 ? null : 'Role is required',
    },
  })

  useEffect(() => {
    setPhoneRequired(
      form.values.organizationRole.toString() ===
        OrganizationRole.PROPERTY_MANAGER
    )
  }, [form.values.organizationRole])

  const handleFormSubmit = (values: typeof form.values) => {
    createUserMutation.mutate(values, {
      onSuccess: () => {
        void router.push('/admin')
        showNotification({
          title: 'Success!',
          message: 'Member has been added',
          color: 'teal',
        })
      },
      onError: () =>
        showNotification({
          title: 'Error',
          message: 'Something went wrong when adding the member',
          color: 'red',
        }),
    })
  }

  return (
    <form onSubmit={form.onSubmit((values) => handleFormSubmit(values))}>
      <Stack maw={575}>
        <Title order={1}>Add a member</Title>
        <Select
          w="50%"
          data={[
            { value: OrganizationRole.PROPERTY_OWNER, label: 'Property owner' },
            {
              value: OrganizationRole.PROPERTY_MANAGER,
              label: 'Property manager',
            },
          ]}
          label="Role"
          withAsterisk
          {...form.getInputProps('organizationRole')}
        />
        <TextInput
          w="calc(50% - .5rem)"
          label="Name"
          withAsterisk
          {...form.getInputProps('name')}
        />
        <TextInput
          w="50%"
          label="Email"
          withAsterisk
          {...form.getInputProps('email')}
        />

        <InternationalPhoneInput
          label="Phone"
          width="50%"
          value={form.values.phone}
          error={form.errors.phone}
          required={phoneRequired}
          onChange={(value) => {
            form.setFieldValue('phone', value)
          }}
        />

        <Button w={128} type="submit">
          Submit
        </Button>
      </Stack>
    </form>
  )
}

export default AddOwnerPage
