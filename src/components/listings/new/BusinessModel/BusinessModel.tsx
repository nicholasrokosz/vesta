import { useEffect, useState } from 'react'
import {
  createStyles,
  Button,
  Flex,
  Stack,
  Table,
  Title,
  NumberInput,
  Text,
  Switch,
  Checkbox,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useListState } from '@mantine/hooks'
import { v4 as uuidv4 } from 'uuid'
import { IconLock, IconPercentage } from '@tabler/icons-react'

import { DeductionsSchema, BusinessModel } from 'types/listings'
import type { Deductions, FeeCreate } from 'types/listings'
import { api } from 'utils/api'

import FeesRow from '../FeesRow/FeesRow'
import { FeeUnit, FeeType } from 'types'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import Info from 'components/common/Info/Info'

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.colors.neutral[2],
  },
  table: {
    marginTop: 10,
    border: '1px solid',
    borderColor: theme.colors.neutral[3],
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
    bottom: 2,
  },
  disabledSwitch: {
    cursor: 'not-allowed',
  },
  description: {
    color: theme.colors.gray[6],
    fontSize: '1rem',
    marginTop: -12,
  },
  icon: {
    marginLeft: 8,
    marginRight: 8,
    color: theme.colors.neutral[6],
  },
  switchGroup: {
    '& *': {
      '&:hover': {
        cursor: 'pointer',
      },
    },
  },
}))

interface Props {
  onSuccess: () => void
  onError: () => void
  listingId: string
  buttonText: string
}

const BusinessModel = ({
  onSuccess,
  onError,
  listingId,
  buttonText,
}: Props) => {
  const { classes } = useStyles()

  const mutation = api.listing.upsertBusinessModel.useMutation()
  const { data: rulesData, isLoading: rulesLoading } =
    api.listing.getRules.useQuery({ listingId })
  const { data: feesData, isLoading: feesLoading } =
    api.listing.getBusinessModel.useQuery({ listingId })

  const [fees, feesHandlers] = useListState<FeeCreate>(feesData?.fees)
  const [petsAllowed, setPetsAllowed] = useState<boolean>(false)
  const [deposit, setDeposit] = useState<boolean>(false)
  const [managerShare, setManagerShare] = useState<number>(50)
  const [ownerShare, setOwnerShare] = useState<number>(50)
  const [municipal, setMunicipal] = useState<number | ''>(0)
  const [county, setCounty] = useState<number | ''>(0)
  const [state, setState] = useState<number | ''>(0)
  const [airbnbRemitsTaxes, setAirbnbRemitsTaxes] = useState<boolean>(false)

  const form = useForm<Deductions>({
    validate: zodResolver(DeductionsSchema),
  })

  useEffect(() => {
    if (feesData?.fees) feesHandlers.setState(feesData?.fees)
  }, [feesData?.fees])

  useEffect(() => {
    if (feesData?.taxRates) {
      const { state, municipal, county } = feesData.taxRates
      setMunicipal(municipal || 0)
      setState(state || 0)
      setCounty(county || 0)
    }
  }, [feesData?.taxRates])

  useEffect(() => {
    if (feesData?.deductions) {
      form.setValues(feesData.deductions)
      setManagerShare(feesData.deductions.pmcShare || 50)
      setOwnerShare(
        feesData.deductions.pmcShare ? 100 - feesData.deductions.pmcShare : 50
      )
    } else {
      form.setValues({
        channelFees: true,
        creditCardFees: true,
        discounts: true,
        municipalTaxes: true,
        countyTaxes: true,
        stateTaxes: true,
        otherGuestFees: true,
      })
    }
    form.setFieldValue('listingId', listingId)
  }, [feesData?.deductions])

  useEffect(() => {
    if (rulesData) {
      setPetsAllowed(rulesData.pets)
      setDeposit(rulesData.deposit)
    }
  }, [rulesData])

  useEffect(() => {
    const feeExists = fees.find((fee) => {
      return fee.type === FeeType.CleaningFee
    })
    if (!feeExists) {
      feesHandlers.append({
        name: 'Cleaning fee',
        type: FeeType.CleaningFee,
        unit: FeeUnit.PerStay,
        taxable: false,
        value: 0,
        share: 0,
      })
    }
  }, [fees])

  useEffect(() => {
    const feeExists = fees.find((fee) => {
      return fee.type === FeeType.PetFee
    })
    if (!feeExists && petsAllowed) {
      feesHandlers.append({
        name: 'Pet fee',
        type: FeeType.PetFee,
        unit: FeeUnit.PerStay,
        taxable: false,
        value: 0,
        share: 0,
      })
    }
  }, [petsAllowed])

  useEffect(() => {
    const feeExists = fees.find((fee) => {
      return fee.type === FeeType.Deposit
    })
    if (!feeExists && deposit) {
      feesHandlers.append({
        name: 'Security deposit',
        type: FeeType.Deposit,
        unit: FeeUnit.PerStay,
        taxable: false,
        value: 0,
        share: 0,
      })
    }
  }, [deposit])

  useEffect(() => {
    if (mutation.isSuccess) {
      onSuccess()
    }
    if (mutation.isError) {
      onError()
    }
  }, [mutation.isSuccess, mutation.isError])

  useEffect(() => {
    form.setFieldValue('pmcShare', managerShare)
  }, [managerShare])

  useEffect(() => {
    setAirbnbRemitsTaxes(feesData?.airbnbRemitsTaxes || false)
  }, [feesData?.airbnbRemitsTaxes])

  const submitForm = (deductions: Deductions) => {
    const newBusinessModel: BusinessModel = {
      listingId,
      deductions: {
        ...deductions,
        pmcShare: managerShare,
        otherGuestFees: true,
      },
      taxRates: {
        municipal: municipal !== '' ? municipal : 0,
        county: county !== '' ? county : 0,
        state: state !== '' ? state : 0,
      },
      fees: fees,
      airbnbRemitsTaxes: airbnbRemitsTaxes,
    }
    mutation.mutate(newBusinessModel)
  }

  const addFee = () => {
    const newFee: FeeCreate = {
      name: '',
      type: FeeType.General,
      value: 0,
      share: 0,
      unit: '',
      taxable: false,
    }
    feesHandlers.setState([...fees, newFee])
  }

  const handleSplitChange = (val: number | '', target: 'manager' | 'owner') => {
    if (val === '') {
      setManagerShare(0)
      setOwnerShare(0)
    } else if (target === 'manager') {
      setManagerShare(val)
      setOwnerShare(100 - val)
    } else {
      setOwnerShare(val)
      setManagerShare(100 - val)
    }
  }

  return (
    <div className="loading-spinner-container">
      <VestaSpinnerOverlay
        visible={rulesLoading || feesLoading || mutation.isLoading}
      />
      <form onSubmit={form.onSubmit((values) => submitForm(values))}>
        <Flex justify={'flex-end'}>
          <Button type="submit">{buttonText}</Button>
        </Flex>
        <Stack spacing={'sm'}>
          <Title order={2}>Deductions</Title>
          <Text className={classes.description}>
            Deductions are used to calculate net revenue <br /> (gross revenue -
            enabled deductions = net revenue)
          </Text>
          <Stack mb={16} className={classes.switchGroup}>
            <Switch
              label="Channel fees"
              defaultChecked={true}
              {...form.getInputProps('channelFees', { type: 'checkbox' })}
            />
            <Switch
              label="Credit card fees"
              defaultChecked={true}
              {...form.getInputProps('creditCardFees', { type: 'checkbox' })}
            />
            <Switch
              label="Discounts"
              defaultChecked={true}
              {...form.getInputProps('discounts', { type: 'checkbox' })}
            />
            <Switch
              label="Municipal taxes"
              defaultChecked={true}
              {...form.getInputProps('municipalTaxes', { type: 'checkbox' })}
            />
            <Switch
              label="County taxes"
              defaultChecked={true}
              {...form.getInputProps('countyTaxes', { type: 'checkbox' })}
            />
            <Switch
              label="State taxes"
              defaultChecked={true}
              {...form.getInputProps('stateTaxes', { type: 'checkbox' })}
            />
            <Switch
              label="Other guest fees"
              checked={true}
              onLabel={<IconLock size="0.8rem" />}
            />
          </Stack>
          <Title order={2}>Net revenue split</Title>
          <Stack>
            <NumberInput
              value={managerShare}
              onChange={(val) => handleSplitChange(val, 'manager')}
              rightSection={<IconPercentage className={classes.icon} />}
              w={90}
              label={
                <Text mb={4} w="max-content">
                  Property manager share
                </Text>
              }
              size="md"
              hideControls
              precision={1}
              min={0}
              max={100}
              removeTrailingZeros
            />
            <NumberInput
              value={ownerShare}
              onChange={(val) => handleSplitChange(val, 'owner')}
              rightSection={<IconPercentage className={classes.icon} />}
              w={90}
              label={
                <Text mb={4} w="max-content">
                  Property owner share
                </Text>
              }
              size="md"
              hideControls
              precision={1}
              min={0}
              max={100}
              removeTrailingZeros
            />
          </Stack>
          <Title order={2}>Tax rates</Title>
          <Stack>
            <Flex gap="xl">
              <NumberInput
                rightSection={<IconPercentage className={classes.icon} />}
                value={municipal}
                onChange={(val) => setMunicipal(val === '' ? 0 : val)}
                size="md"
                w={90}
                label={
                  <Text mb={4} w="max-content">
                    Municipal rate
                  </Text>
                }
                hideControls
                precision={2}
              />
              <NumberInput
                rightSection={<IconPercentage className={classes.icon} />}
                value={county}
                onChange={(val) => setCounty(val === '' ? 0 : val)}
                size="md"
                w={90}
                label={<Text mb={4}>County rate</Text>}
                hideControls
                precision={2}
              />
              <NumberInput
                rightSection={<IconPercentage className={classes.icon} />}
                value={state}
                onChange={(val) => setState(val === '' ? 0 : val)}
                size="md"
                w={90}
                label={<Text mb={4}>State rate</Text>}
                hideControls
                precision={2}
              />
            </Flex>
            <Flex direction="column">
              <Checkbox
                // className={classes.rulesCheck}
                checked={airbnbRemitsTaxes}
                onChange={(event) =>
                  setAirbnbRemitsTaxes(event.currentTarget.checked)
                }
                label={
                  <>
                    <Text>
                      Taxes are automatically remitted to Airbnb{' '}
                      <Info label="Check if Airbnb handles taxes on your behalf" />
                    </Text>
                  </>
                }
              />
              <Stack spacing="s">
                <Text className={classes.description}></Text>
              </Stack>
            </Flex>
          </Stack>
          <Title order={2}>Other guest fees</Title>
          <Table striped={true} maw={900}>
            <thead>
              <tr className={classes.header}>
                <th>Fee type</th>
                <th>Fee amount</th>
                <th>Fee driver</th>
                <th>Property manager share (%)</th>
                <th>Taxable</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee, index) => (
                <FeesRow
                  key={uuidv4()}
                  fee={fee}
                  remove={() => feesHandlers.remove(index)}
                />
              ))}
            </tbody>
            <tfoot>
              <tr>
                <Button mt={16} onClick={() => addFee()}>
                  Add Fee
                </Button>
              </tr>
            </tfoot>
          </Table>
        </Stack>
        <Flex justify={'flex-end'}>
          <Button type="submit">{buttonText}</Button>
        </Flex>
      </form>
    </div>
  )
}

export default BusinessModel
