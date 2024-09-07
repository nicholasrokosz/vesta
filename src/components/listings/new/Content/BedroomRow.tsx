import {
  ActionIcon,
  Checkbox,
  createStyles,
  Flex,
  Select,
  Text,
} from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import type { Bedroom } from 'types/listings'
import { v4 as uuidv4 } from 'uuid'

const useStyles = createStyles((theme) => ({
  specificCell: {
    borderTop: 'none',
    borderBottom: 'none',
  },
  addBed: {
    textDecoration: 'none',
    color: theme.colors.gray[5],
    '&:hover': {
      cursor: 'pointer',
      color: theme.colors.gray[6],
    },
  },
}))

interface BedProps {
  bed: string
  remove: () => void
  onChange: (value: string) => void
}
const BedRow = ({ bed, remove, onChange }: BedProps) => {
  return (
    <Flex align="center" pb={5}>
      <Select data={bedList} searchable value={bed} onChange={onChange} />
      <ActionIcon variant="subtle" onClick={remove}>
        <IconX size={12} />
      </ActionIcon>
    </Flex>
  )
}

const rooms = [
  { label: 'Bedroom', value: 'Bedroom' },
  { label: 'Living Room', value: 'Living Room' },
]

const bedList = [
  { label: 'King bed', value: 'RMA58' },
  { label: 'Queen bed', value: 'RMA86' },
  { label: 'Sofa bed', value: 'RMA102' },
  { label: 'Twin bed', value: 'RMA113' },
  { label: 'Futon', value: 'RMA200' },
  { label: 'Murphy bed', value: 'RMA201' },
  { label: 'Single bed', value: 'RMA203' },
  { label: 'Bunk bed', value: 'RMA6032' },
  { label: 'Full / double bed', value: 'RMA33' },
  { label: 'Cribs', value: 'RMA26' },
  { label: 'Extra bed', value: 'RMA6038' },
  { label: 'Couch', value: 'RMA6118' },
  { label: 'Air mattress', value: 'RMA6119' },
  { label: 'Floor mattress', value: 'RMA6120' },
  { label: 'Toddler bed', value: 'RMA6121' },
  { label: 'Hammock', value: 'RMA6122' },
]

interface Props {
  bedroom: Bedroom
  remove: () => void
  onChange: (value: Bedroom) => void
}

const BedroomRow = ({ bedroom, remove, onChange }: Props) => {
  const { classes } = useStyles()

  return (
    <tr>
      <td className={classes.specificCell} valign="top">
        <Select
          data={rooms}
          value={bedroom.type}
          onChange={(value) => onChange({ ...bedroom, type: value as string })}
        />
      </td>
      <td className={classes.specificCell} valign="top">
        <Checkbox
          pt={10}
          checked={bedroom.bathroom ?? false}
          onChange={(event) =>
            onChange({ ...bedroom, bathroom: event.currentTarget.checked })
          }
        />
      </td>
      <td className={classes.specificCell} align="right" valign="bottom">
        <>
          {bedroom.beds.map((bed, index) => (
            <BedRow
              key={uuidv4()}
              bed={bed}
              remove={() => {
                bedroom.beds.splice(index, 1)
                onChange({ ...bedroom, beds: bedroom.beds })
              }}
              onChange={(value: string) => {
                bedroom.beds[index] = value
                onChange({ ...bedroom, beds: bedroom.beds })
              }}
            />
          ))}
          <Text
            onClick={() => {
              bedroom.beds.push('RMA86')
              onChange({ ...bedroom, beds: bedroom.beds })
            }}
            pr={30}
            pt={10}
            className={classes.addBed}
          >
            Add a bed
          </Text>
        </>
      </td>
      <td valign="top">
        <ActionIcon variant="subtle" onClick={remove} pt={10}>
          <IconX size={16} />
        </ActionIcon>
      </td>
    </tr>
  )
}

export default BedroomRow
