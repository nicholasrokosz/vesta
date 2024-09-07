import { useEffect, useRef, useState } from 'react'
import {
  createStyles,
  Title,
  Table,
  NumberInput,
  Button,
  Flex,
  Box,
  Alert,
  Input,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { api } from 'utils/api'
import { DatePickerInput } from '@mantine/dates'
import {
  IconPercentage,
  IconCurrencyDollar,
  IconAlertCircle,
} from '@tabler/icons-react'
import DatesRow from '../DatesRow/DatesRow'
import { useListState } from '@mantine/hooks'
import { v4 as uuidv4 } from 'uuid'
import { PricingCreateSchema } from 'types/pricing'
import type { PricingDate } from 'types/pricing'
import { Pricing } from 'types/pricing'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import Info from 'components/common/Info/Info'
import { DynamicPricing } from '@prisma/client'
import Link from 'next/link'

const useStyles = createStyles((theme) => ({
  table: {
    marginTop: 10,
    marginBottom: 20,
    border: '1px solid',
    borderColor: theme.colors.neutral[3],
  },
  header: {
    backgroundColor: theme.colors.neutral[2],
  },
  cell: {
    whiteSpace: 'nowrap',
  },
  number: {
    fontSize: theme.fontSizes.xl,
    height: 10,
  },
  icon: {
    marginLeft: 8,
    marginRight: 8,
    color: theme.colors.neutral[6],
  },
  addDates: {
    marginBottom: 20,
    width: 300,
  },
}))

interface Props {
  onSuccess: () => void
  onError: () => void
  listingId: string
  buttonText: string
}

const Pricing = ({ onSuccess, onError, listingId, buttonText }: Props) => {
  const { classes } = useStyles()
  const mutation = api.listing.upsertPricing.useMutation()
  const { data, isLoading } = api.listing.getPricing.useQuery({ listingId })

  const [weeklyPercent, setWeeklyPercent] = useState<number>(0)
  const [monthlyPercent, setMonthlyPercent] = useState<number>(0)
  const [pricingDates, pricingDatesHandlers] = useListState<PricingDate>([])
  const [selectedDate, setSelectedDate] = useState<[Date | null, Date | null]>([
    null,
    null,
  ])
  const [alertText, setAlertText] = useState<string>('')

  const alertRef = useRef<HTMLDivElement>(null)

  const form = useForm<Pricing>({
    validate: zodResolver(PricingCreateSchema),
  })

  useEffect(() => {
    if (data) {
      const formData = {
        id: data.id,
        listingId: data.listingId,
        minimum: data.minimum,
        weekday: data.weekday,
        weekend: data.weekend,
        minStay: data.minStay,
        maxStay: data.maxStay,
        dates: data.dates,
        discounts: data.discounts,
        dynamicPricing: data.dynamicPricing,
      }

      form.setValues(formData)
      pricingDatesHandlers.setState(data.dates)
      if (data.discounts) {
        data.discounts.forEach((discount) => {
          if (discount.days === 7) {
            setWeeklyPercent(discount.percent ?? 0)
          }
          if (discount.days === 28) {
            setMonthlyPercent(discount.percent ?? 0)
          }
        })
      } else form.setFieldValue('discounts', [])
    } else {
      form.setFieldValue('listingId', listingId)
      form.setFieldValue('dates', [])
      form.setFieldValue('discounts', [])
      form.setFieldValue('dynamicPricing', DynamicPricing.None)
    }
  }, [data])

  const submitForm = (values: Pricing) => {
    values.dates = pricingDates
    const discounts = [
      {
        days: 7,
        percent: weeklyPercent,
      },
      {
        days: 28,
        percent: monthlyPercent,
      },
    ]
    values.discounts = discounts
    mutation.mutate(values)
  }

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

  useEffect(() => {
    if (!selectedDate || !selectedDate[0] || !selectedDate[1]) return
    pricingDatesHandlers.append({
      startDate: selectedDate[0],
      endDate: selectedDate[1],
      percent: 100,
    })
    setSelectedDate([null, null])
  }, [selectedDate])

  const checkExcluded = (date: Date) => {
    return pricingDates.some((pricingDate) => {
      return pricingDate.startDate <= date && date <= pricingDate.endDate
    })
  }

  const requiredFieldsMap: { [key: string]: string } = {
    minimum: 'Minimum',
    weekday: 'Weekday base rate',
    weekend: 'Weekend base rate',
    minStay: 'Minimum stay in days',
    maxStay: 'Maximum stay in days',
  }

  return (
    <div className="loading-spinner-container">
      <VestaSpinnerOverlay visible={isLoading || mutation.isLoading} />
      {data && data.dynamicPricing == DynamicPricing.PriceLabs && (
        <Box pt="sm" mb="sm">
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Pricing managed by PriceLabs"
            color="red"
          >
            Pricing for this listing is managed by PriceLabs. Any changes made
            below will not be reflected on your listing. Please make any updates
            on{' '}
            <Link href="https://pricelabs.co/pricing" target="_blank">
              PriceLabs
            </Link>
            .
          </Alert>
        </Box>
      )}
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
          (values) => submitForm(values),
          () => {
            alertRef.current?.scrollIntoView({ behavior: 'smooth' })
          }
        )}
      >
        <Flex justify={'flex-end'}>
          <Button type="submit">{buttonText}</Button>
        </Flex>
        <Title order={2} pb={10}>
          Length of Stay
        </Title>
        <Flex align="top">
          <NumberInput
            label="Minimum stay in days"
            min={1}
            withAsterisk
            pr={15}
            {...form.getInputProps('minStay')}
          />
          <NumberInput
            label="Maximum stay in days"
            min={1}
            withAsterisk
            pr={15}
            {...form.getInputProps('maxStay')}
          />
        </Flex>
        <div>
          <Title order={2}>Base Rates</Title>
          <div>
            <Input type="hidden" {...form.getInputProps('dynamicPricing')} />
            <Table w={300} className={classes.table} striped={true}>
              <thead>
                <tr className={classes.header}>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={classes.cell}>Minimum</td>
                  <td>
                    <NumberInput
                      min={1}
                      icon={<IconCurrencyDollar size={16} />}
                      size="md"
                      iconWidth={25}
                      hideControls
                      precision={0}
                      {...form.getInputProps('minimum')}
                    />
                  </td>
                </tr>
                <tr>
                  <td className={classes.cell}>Weekday base rate</td>
                  <td>
                    <NumberInput
                      icon={<IconCurrencyDollar size={16} />}
                      size="md"
                      iconWidth={25}
                      hideControls
                      precision={0}
                      {...form.getInputProps('weekday')}
                    />
                  </td>
                </tr>
                <tr>
                  <td className={classes.cell}>
                    Weekend base rate{' '}
                    <Info label="Friday and Saturday nights" />
                  </td>
                  <td>
                    <NumberInput
                      icon={<IconCurrencyDollar size={16} />}
                      size="md"
                      iconWidth={25}
                      hideControls
                      precision={0}
                      {...form.getInputProps('weekend')}
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>

          <Title order={2}>Specific Dates</Title>
          <div>
            <Table w={300} className={classes.table}>
              <tbody>
                {pricingDates.map((pricingDate, index) => (
                  <DatesRow
                    key={uuidv4()}
                    pricingDate={pricingDate}
                    remove={() => pricingDatesHandlers.remove(index)}
                  />
                ))}
              </tbody>
            </Table>
          </div>

          <DatePickerInput
            type="range"
            className={classes.addDates}
            placeholder="Add a date range"
            value={selectedDate}
            onChange={setSelectedDate}
            allowSingleDateInRange={true}
            minDate={new Date()}
            excludeDate={checkExcluded}
          />

          <Title order={2}>Discounts</Title>
          <div>
            <Table w={300} className={classes.table}>
              <tbody>
                <tr>
                  <td className={classes.cell}>
                    Weekly stay{' '}
                    <Info label="Applies to reservations that are 7+ days or longer" />
                  </td>
                  <td>
                    <NumberInput
                      rightSection={<IconPercentage className={classes.icon} />}
                      size="md"
                      min={0}
                      max={99}
                      iconWidth={28}
                      hideControls
                      precision={0}
                      value={weeklyPercent}
                      onChange={(val) => setWeeklyPercent(val || 0)}
                    />
                  </td>
                </tr>
                <tr>
                  <td className={classes.cell}>
                    Monthly stay{' '}
                    <Info label="Applies to reservations that are 28+ days or longer" />
                  </td>
                  <td>
                    <NumberInput
                      rightSection={<IconPercentage className={classes.icon} />}
                      size="md"
                      min={0}
                      max={99}
                      iconWidth={28}
                      hideControls
                      precision={0}
                      value={monthlyPercent}
                      onChange={(val) => setMonthlyPercent(val || 0)}
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>

        <Flex justify={'flex-end'}>
          <Button type="submit">{buttonText}</Button>
        </Flex>
      </form>
    </div>
  )
}

export default Pricing
