import { createStyles, Flex, Text } from '@mantine/core'
import { IconStar } from '@tabler/icons-react'

export interface IRating {
  average: number
  count: number
}

const useStyles = createStyles((theme) => ({
  text: {
    color: theme.colors.neutral[7],
    paddingLeft: 5,
  },
}))

interface Props {
  rating: IRating
}

const Rating = (props: Props) => {
  const { classes } = useStyles()

  return (
    <Flex align="center" columnGap={2}>
      <Flex align="center" columnGap={3}>
        <IconStar />
      </Flex>
      <div>
        <Text className={classes.text}>
          {`${props.rating.average} (${props.rating.count})`}
        </Text>
      </div>
    </Flex>
  )
}

export default Rating
