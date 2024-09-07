import { useEffect, useRef, useState } from 'react'
import {
  createStyles,
  Stack,
  Flex,
  Button,
  Title,
  Select,
  NumberInput,
  Box,
  Alert,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { api } from 'utils/api'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import { IconAlertCircle } from '@tabler/icons-react'
import { Availability, AvailabilitySchema } from 'types/listings'

const useStyles = createStyles(() => ({
  stack: {
    paddingBottom: 26,
  },
  header: {
    paddingBottom: 10,
  },
  checkTime: {
    width: 200,
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: '#212529',
  },
  chipGroup: {
    display: 'flex',
    gap: 10,
  },
}))

interface Props {
  onSuccess: (newListingId?: string) => void
  onError: () => void
  listingId: string
  buttonText: string
}

const Availability = ({ onSuccess, onError, listingId, buttonText }: Props) => {
  const { classes } = useStyles()
  const mutation = api.listing.upsertAvailability.useMutation()
  const { data, isLoading } = api.listing.getAvailability.useQuery({
    listingId,
  })
  const [alertText, setAlertText] = useState<string>('')

  const alertRef = useRef<HTMLDivElement>(null)

  const form = useForm<Availability>({
    validate: zodResolver(AvailabilitySchema),
  })

  useEffect(() => {
    console.log('availability.data', data)
    if (data) {
      form.setValues(data)
    } else form.setFieldValue('listingId', listingId)
  }, [data])

  useEffect(() => {
    if (mutation.isSuccess) {
      onSuccess()
    }
    if (mutation.isError) {
      onError()
    }
  }, [mutation.isSuccess, mutation.isError])

  useEffect(() => {
    setAlertText(
      Object.keys(form.errors)
        .map((str) => requiredFieldsMap[str])
        .join(', ')
    )
  }, [form.errors])

  const getTimes = (start: number, end: number) => {
    const timeOptions = []
    for (let hour = start; hour < end; hour++) {
      let hourLabel, hourLabel30
      if (hour < 12) {
        hourLabel = `${hour}:00 am`
        hourLabel30 = `${hour}:30 am`
      } else if (hour === 12) {
        hourLabel = 'Noon'
        hourLabel30 = '12:30'
      } else {
        hourLabel = `${hour - 12}:00 pm`
        hourLabel30 = `${hour - 12}:30 pm`
      }

      timeOptions.push({
        value: `${hour}:00`,
        label: hourLabel,
      })
      timeOptions.push({
        value: `${hour}:30`,
        label: hourLabel30,
      })
    }
    return timeOptions
  }

  const requiredFieldsMap: { [key: string]: string } = {
    checkOut: 'Checkout time',
    checkIn: 'Check-in time',
  }

  return (
    <div className="loading-spinner-container">
      <VestaSpinnerOverlay visible={isLoading || mutation.isLoading} />
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
      <form
        onSubmit={form.onSubmit(
          (values) => mutation.mutate(values),
          () => {
            alertRef.current?.scrollIntoView({ behavior: 'smooth' })
          }
        )}
      >
        {/* Removing top button for now since the page is so short
        <Flex justify={'flex-end'}>
          <Button type="submit">{buttonText}</Button>
        </Flex> */}
        <Stack className={classes.stack}>
          <Title order={2} className={classes.header}>
            Policies
          </Title>
          <Select
            label="Checkout time"
            data={getTimes(9, 16)}
            withAsterisk
            searchable
            className={classes.checkTime}
            {...form.getInputProps('checkOut')}
          />
          <Select
            label="Check-in time"
            data={getTimes(9, 18)}
            withAsterisk
            searchable
            className={classes.checkTime}
            {...form.getInputProps('checkIn')}
          />

          <Flex>
            <NumberInput
              label="Minimum lead time for new reservation"
              min={0}
              max={7}
              withAsterisk
              pr={15}
              {...form.getInputProps('leadTime')}
            />
          </Flex>
        </Stack>

        <Flex justify={'flex-end'}>
          <Button type="submit">{buttonText}</Button>
        </Flex>
      </form>
    </div>
  )
}

export default Availability
