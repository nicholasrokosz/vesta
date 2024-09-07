import { Flex, Select, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { api } from 'utils/api'
import { timeZones } from 'utils/timeZones'

// NOTE: Not yet ready to be use
// code taken from commit 45d8af77
const AddressForm = () => {
  const { data: countries } = api.addresses.getCountries.useQuery()
  const form = useForm({
    initialValues: {
      name: '',
      phone: '',
      email: '',
      country: '',
      timeZone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      zip: '',
    },
  })

  const selectedCountry =
    countries &&
    countries.find((country) => country.code === form.values.country)

  const zoneData =
    selectedCountry?.zones.map(({ name, code }) => ({
      label: name,
      value: code,
    })) ?? []

  return (
    <Stack spacing="xxs">
      <Flex w="100%" gap="md" direction={{ base: 'column', sm: 'row' }}>
        <Select
          w="50%"
          label="Country"
          placeholder=" "
          data={
            countries?.map((country) => {
              return {
                value: country.code,
                label: country.name,
              }
            }) ?? []
          }
          miw={270}
          searchable
          {...form.getInputProps('country')}
          onChange={(val) => form.setValues({ country: val ?? '', state: '' })}
        />
        <Select
          label="Time zone"
          placeholder="Pick one"
          miw={270}
          searchable
          data={timeZones()}
          {...form.getInputProps('timeZone')}
        />
      </Flex>
      <Flex gap="md" direction={{ base: 'column', sm: 'row' }}>
        <TextInput
          label="Street"
          w={{ base: '100%', sm: 375 }}
          {...form.getInputProps('line1')}
        />
        <TextInput label="Apt, suite, etc." {...form.getInputProps('line2')} />
      </Flex>
      <TextInput label="City" {...form.getInputProps('city')} />
      <Flex gap="md" w="100%" direction={{ base: 'column', sm: 'row' }}>
        <Select
          label="State, province, region, etc."
          placeholder=" "
          data={zoneData}
          w={{ base: '100%', sm: 375 }}
          searchable
          {...form.getInputProps('state')}
        />
        <TextInput label="Zip code" {...form.getInputProps('zip')} />
      </Flex>
    </Stack>
  )
}

export default AddressForm
