import { createStyles, Button, Center, Text, Flex } from '@mantine/core'
import type { IButtonAmenity } from 'types'

const useStyles = createStyles((theme) => ({
  button: {
    borderRadius: 8,
    width: 160,
    height: 92,
  },
  name: {
    whiteSpace: 'normal',
    textAlign: 'center',
    marginTop: 4,
  },
  selected: {
    border: `2px solid ${theme.colors.vesta[6]}`,
    background: '#F6F1FF',
    '&:hover': {
      background: '#EEE6FF',
    },
  },
}))

interface Props {
  amenity: IButtonAmenity
  index: number
  amenityButtons: IButtonAmenity[]
  setAmenityButtons: (amenityButtons: IButtonAmenity[]) => void
  syncAmenitiesTable: (typeId: string, checked: boolean) => void
}

const AmenityButton = ({
  amenity: { name, typeId, icon, selected },
  index,
  amenityButtons,
  setAmenityButtons,
  syncAmenitiesTable,
}: Props) => {
  const { classes, cx } = useStyles()

  const handleClick = () => {
    const copy = [...amenityButtons]
    copy[index] = { ...copy[index], selected: !selected }
    syncAmenitiesTable(typeId, !selected)
    setAmenityButtons(copy)
  }

  return (
    <Button
      className={cx(classes.button, { [classes.selected]: selected })}
      variant="default"
      onClick={() => handleClick()}
    >
      <Center>
        <Flex align="center" direction="column">
          <>
            {icon}
            <Text className={classes.name}>{name}</Text>
          </>
        </Flex>
      </Center>
    </Button>
  )
}

export default AmenityButton
