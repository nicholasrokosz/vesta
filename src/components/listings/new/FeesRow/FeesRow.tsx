import { useEffect, useState } from 'react'
import {
  createStyles,
  ActionIcon,
  Checkbox,
  NumberInput,
  Select,
  TextInput,
} from '@mantine/core'
import { IconCurrencyDollar, IconPercentage, IconX } from '@tabler/icons-react'
import type { FeeCreate } from 'types/listings'
import { FeeType, FeeUnit } from 'types'
import { camelToSentenceCase } from 'utils/vesta'

const useStyles = createStyles((theme) => ({
  icon: {
    marginLeft: 8,
    marginRight: 8,
    color: theme.colors.neutral[6],
  },
  feeType: {
    minWidth: 95,
  },
}))

interface Props {
  fee: FeeCreate
  remove: () => void
}

const FeesRow = ({ fee, remove }: Props) => {
  const { classes } = useStyles()

  const [name, setName] = useState<string | ''>(fee.name)
  const [unit, setUnit] = useState<string | null>(fee.unit)
  const [value, setValue] = useState<number | ''>(fee.value)
  const [share, setShare] = useState<number | ''>(fee.share)
  const [taxable, setTaxable] = useState<boolean>(fee.taxable)

  useEffect(() => {
    fee.name = name
    fee.unit = unit || ''
    fee.value = value || 0
    fee.share = share || 0
    fee.taxable = taxable
  }, [name, unit, value, share, taxable])

  const getNameCell = () => {
    if (fee.type != FeeType.PetFee && fee.type != FeeType.CleaningFee) {
      return (
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          withAsterisk
        />
      )
    } else {
      return <>{camelToSentenceCase(name)}</>
    }
  }

  const getUnitCell = () => {
    if (fee.type != FeeType.PetFee && fee.type != FeeType.CleaningFee) {
      return (
        <Select
          w={192}
          placeholder=""
          data={Object.keys(FeeUnit).map((str) => ({
            value: str,
            label: camelToSentenceCase(str),
          }))}
          withAsterisk
          searchable
          value={unit}
          onChange={setUnit}
        />
      )
    } else {
      return <>{camelToSentenceCase(unit || '')}</>
    }
  }

  return (
    <tr>
      <td className={classes.feeType}>{getNameCell()}</td>
      <td>
        <NumberInput
          w={100}
          min={0}
          icon={<IconCurrencyDollar size={16} />}
          size="md"
          iconWidth={25}
          hideControls
          precision={0}
          onChange={setValue}
          value={value}
        />
      </td>
      <td>{getUnitCell()}</td>
      <td>
        <NumberInput
          w={80}
          min={0}
          max={100}
          rightSection={<IconPercentage className={classes.icon} />}
          size="md"
          iconWidth={25}
          hideControls
          precision={1}
          value={share}
          onChange={setShare}
        />
      </td>
      <td>
        <Checkbox
          checked={taxable}
          onChange={(event) => setTaxable(event.currentTarget.checked)}
        />
      </td>
      <td>
        <input type="hidden" value={fee.type} />
        {fee.type != 'PetFee' && fee.type != 'CleaningFee' && (
          <ActionIcon variant="subtle" onClick={remove}>
            <IconX size={14} />
          </ActionIcon>
        )}
      </td>
    </tr>
  )
}

export default FeesRow
