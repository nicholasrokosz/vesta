import { useEffect, useState } from 'react'
import { ActionIcon, createStyles, NumberInput } from '@mantine/core'
import { IconPercentage, IconX } from '@tabler/icons-react'
import { formatDates } from 'utils/vesta'
import type { PricingDate } from 'types/pricing'

const useStyles = createStyles((theme) => ({
  specificCell: {
    borderTop: 'none',
    borderBottom: 'none',
  },
  rateInput: {
    width: 110,
  },
  icon: {
    marginLeft: 8,
    marginRight: 8,
    color: theme.colors.neutral[6],
  },
}))

interface Props {
  pricingDate: PricingDate
  remove: () => void
}

const DatesRow = ({ pricingDate, remove }: Props) => {
  const { classes } = useStyles()
  const [percent, setPercent] = useState<number | ''>(pricingDate.percent)

  useEffect(() => {
    pricingDate.percent = percent === '' ? 100 : percent
  }, [percent])

  return (
    <tr>
      <td className={classes.specificCell}>
        {formatDates([pricingDate.startDate, pricingDate.endDate])}
      </td>
      <td className={classes.specificCell}>
        <NumberInput
          className={classes.rateInput}
          min={1}
          rightSection={<IconPercentage className={classes.icon} size={16} />}
          value={percent}
          onChange={setPercent}
          size="md"
          iconWidth={28}
          hideControls
          precision={0}
        />
      </td>
      <td>
        <ActionIcon variant="subtle" onClick={remove}>
          <IconX size={14} />
        </ActionIcon>
      </td>
    </tr>
  )
}

export default DatesRow
