import { Alert, Box } from '@mantine/core'
import type { SelectItem } from '@mantine/core'
import {
  Button,
  createStyles,
  Flex,
  NumberInput,
  Select,
  Stack,
  TextInput,
  Title,
  Textarea,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useEffect, useRef, useState } from 'react'
import type { Listing } from 'types/listings'
import { ListingSchema } from 'types/listings'
import { api } from 'utils/api'
import { UnitType } from '@prisma/client'
import { timeZones } from 'utils/timeZones'
import { camelToSentenceCase } from 'utils/vesta'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import { IconAlertCircle, IconCurrencyDollar } from '@tabler/icons-react'

const useStyles = createStyles((theme) => ({
  header: {
    lineHeight: '135%',
    paddingBottom: 26,
  },
  stack: {
    paddingBottom: 26,
  },
  section: {
    color: theme.colors.neutral[4],
  },
  label: {
    fontWeight: 700,
    paddingRight: 15,
    fontSize: theme.fontSizes.xl,
  },
  asterisk: {
    color: theme.colors.red[4],
    fontSize: 11,
    position: 'relative',
  },
  plusIcon: {
    color: theme.colors.vesta[4],
  },
}))

interface Props {
  onSuccess: (newListingId?: string) => void
  onError: () => void
  listingId?: string
  buttonText: string
}

const Details = ({ onSuccess, onError, listingId, buttonText }: Props) => {
  const { classes } = useStyles()
  const mutation = api.listing.upsertListing.useMutation()
  const { data, isLoading } = api.listing.getDetails.useQuery({
    id: listingId ?? '',
  })
  const { data: propertyManagers, isLoading: propertyManagersLoading } =
    api.user.getPropertyManagers.useQuery()

  const { data: propertyOwners, isLoading: propertyOwnersIsLoading } =
    api.user.getPropertyOwners.useQuery()

  const { data: countries, isLoading: countriesIsLoading } =
    api.addresses.getCountries.useQuery()

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [zoneData, setZoneData] = useState<SelectItem[]>([])
  const [alertText, setAlertText] = useState<string>('')

  const form = useForm<Listing>({
    validate: zodResolver(ListingSchema),
  })

  const alertRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listingId && data) form.setValues(data)
  }, [data])

  useEffect(() => {
    if (data && countries) {
      loadZoneData(data.country)
    }
  }, [data, countries])

  useEffect(() => {
    console.log('form.errors', form.errors)
    setAlertText(
      Object.keys(form.errors)
        .map((str) => requiredFieldsMap[str])
        .join(', ')
    )
  }, [form.errors])

  useEffect(() => {
    if (mutation.isSuccess) {
      if (listingId) onSuccess()
      else onSuccess(mutation.data || undefined)
    }
    if (mutation.isError) {
      onError()
    }
  }, [listingId, mutation.isSuccess, mutation.isError])

  useEffect(() => {
    if (selectedCountry) {
      form.setFieldValue('country', selectedCountry)
      form.setFieldValue('state', '')
      loadZoneData(selectedCountry)
    }
  }, [selectedCountry])

  const loadZoneData = (countryCode: string) => {
    const country = countries?.find((country) => country.code === countryCode)
    if (country) {
      setZoneData(
        country.zones.map((zone) => {
          return {
            label: zone.name,
            value: zone.code,
          }
        })
      )
    }
  }

  const requiredFieldsMap: { [key: string]: string } = {
    name: 'Internal name',
    propertyManagerId: 'Property manager',
    unitType: 'Property type',
    basePrice: 'Base price',
    guests: 'Number of guests',
    beds: 'Number of bedrooms',
    baths: 'Number of bathrooms',
    country: 'Country',
    timeZone: 'Time zone',
    line1: 'Street',
    city: 'City',
    state: 'State, province, region, etc.',
    zip: 'Zip code',
  }

  return (
    <div className="loading-spinner-container">
      <VestaSpinnerOverlay
        visible={
          isLoading ||
          mutation.isLoading ||
          propertyManagersLoading ||
          propertyOwnersIsLoading ||
          countriesIsLoading
        }
      />
      <form
        onSubmit={form.onSubmit(
          (values) => mutation.mutate(values),
          () => {
            alertRef.current?.scrollIntoView({ behavior: 'smooth' })
          }
        )}
      >
        <Stack className={classes.stack} maw={555}>
          <Box ref={alertRef} pt="sm" mb="sm">
            {alertText && (
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                title="Please provide values for the following required fields:"
                color="red"
              >
                {alertText}
              </Alert>
            )}
          </Box>
          <Flex justify={'flex-end'}>
            <Button type="submit">{buttonText}</Button>
          </Flex>
          <TextInput
            label="Internal name"
            {...form.getInputProps('name')}
            withAsterisk
          />
          {propertyOwners && (
            <Select
              label="Property owner"
              placeholder=""
              clearable
              data={propertyOwners.map(
                (owner: { id: string; name: string | null }) => {
                  return { value: owner.id, label: owner.name || '' }
                }
              )}
              searchable
              {...form.getInputProps('propertyOwnerId')}
            />
          )}
          {propertyManagers && (
            <Select
              label="Property manager"
              placeholder=""
              data={propertyManagers.map(
                (pm: { id: string; name: string | null }) => {
                  return { value: pm.id, label: pm.name || '' }
                }
              )}
              withAsterisk
              searchable
              {...form.getInputProps('propertyManagerId')}
            />
          )}
          <Title order={2} fz="lg" mt="lg">
            Property details
          </Title>
          <Flex gap="md" direction={{ base: 'column', sm: 'row' }}>
            <Select
              label="Property type"
              placeholder=""
              data={Object.keys(UnitType).map((str) => ({
                value: str,
                label: camelToSentenceCase(str),
              }))}
              withAsterisk
              searchable
              {...form.getInputProps('unitType')}
            />
            <NumberInput
              label="Base price"
              min={1}
              precision={2}
              withAsterisk
              defaultValue={0}
              icon={<IconCurrencyDollar size={16} />}
              iconWidth={25}
              hideControls
              {...form.getInputProps('basePrice')}
            />
          </Flex>
          <Flex gap="md" direction={{ base: 'column', sm: 'row' }}>
            <NumberInput
              label="Number of guests"
              min={1}
              withAsterisk
              {...form.getInputProps('guests')}
            />
            <NumberInput
              label="Number of bedrooms"
              min={1}
              withAsterisk
              {...form.getInputProps('beds')}
            />
            <NumberInput
              label="Number of bathrooms"
              min={0.5}
              step={0.5}
              precision={1}
              withAsterisk
              {...form.getInputProps('baths')}
            />
          </Flex>
          <Title order={2} fz="lg" mt="lg">
            Location
          </Title>
          <Flex gap="md" direction={{ base: 'column', sm: 'row' }}>
            <Select
              label="Country"
              placeholder=" "
              data={
                countries?.map((country) => {
                  return {
                    value: country.code,
                    label: country.name,
                  }
                }) || []
              }
              miw={270}
              withAsterisk
              searchable
              {...form.getInputProps('country')}
              onChange={setSelectedCountry}
            />
            <Select
              label="Time zone"
              placeholder="Pick one"
              miw={270}
              withAsterisk
              searchable
              data={timeZones()}
              {...form.getInputProps('timeZone')}
            />
          </Flex>
          <Flex gap="md" direction={{ base: 'column', sm: 'row' }}>
            <TextInput
              label="Street"
              w={{ base: '100%', sm: 375 }}
              withAsterisk
              {...form.getInputProps('line1')}
            />
            <TextInput
              label="Apt, suite, etc."
              {...form.getInputProps('line2')}
            />
          </Flex>
          <TextInput
            label="City"
            withAsterisk
            {...form.getInputProps('city')}
          />
          <Flex gap="md" w="100%" direction={{ base: 'column', sm: 'row' }}>
            <Select
              label="State, province, region, etc."
              placeholder=" "
              data={zoneData}
              w={{ base: '100%', sm: 375 }}
              withAsterisk
              searchable
              {...form.getInputProps('state')}
            />
            <TextInput
              label="Zip code"
              withAsterisk
              {...form.getInputProps('zip')}
            />
          </Flex>
          <Title order={2} fz="lg" mt="lg">
            Additional details
          </Title>
          <Flex gap="md" direction={{ base: 'column', sm: 'row' }}>
            <TextInput
              label="WiFi name"
              {...form.getInputProps('wifiName')}
              miw={270}
            />
            <TextInput
              label="WiFi password"
              miw={270}
              {...form.getInputProps('wifiPassword')}
            />
          </Flex>
          <Flex gap="md" direction={{ base: 'column', sm: 'row' }}>
            <TextInput
              label="Smart lock door code"
              miw={270}
              {...form.getInputProps('doorCode')}
            />
            <TextInput
              label="Listing URL"
              miw={270}
              {...form.getInputProps('url')}
            />
          </Flex>
          <Textarea
            autosize
            minRows={2}
            label="Notes"
            {...form.getInputProps('notes')}
          />
          <Flex justify={'flex-end'} mt="lg">
            <Button type="submit">{buttonText}</Button>
          </Flex>
        </Stack>
      </form>
    </div>
  )
}

export default Details
