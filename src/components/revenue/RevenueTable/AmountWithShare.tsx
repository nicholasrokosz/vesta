import { Box, Flex, Text, createStyles } from '@mantine/core'
import { formatCurrency } from 'utils/formatCurrency'

const useStyles = createStyles((theme) => ({
  percentage: {
    color: theme.colors.gray[8],
  },
}))

const AmountWithShare = ({
  amount,
  share,
  isDeduction,
  isSummary,
}: {
  amount: number
  share: number
  isDeduction?: boolean
  isSummary?: boolean
}) => {
  const { classes } = useStyles()

  const percentage = share * 100.0

  const determineGap = () => {
    if (isSummary) {
      if (percentage === 100) return 4
      if (percentage === 0) return 18
      return 10
    } else {
      if (percentage === 100) return 8
      if (percentage === 0) return 24
      return 15
    }
  }
  return (
    <Flex justify={'flex-end'} w="100%" gap={determineGap()}>
      <Box ta="right">
        <Text>
          {isDeduction ? `(${formatCurrency(amount)})` : formatCurrency(amount)}
        </Text>
      </Box>
      <Box ta="right">
        <Text className={classes.percentage}>({percentage.toFixed(1)}%)</Text>
      </Box>
    </Flex>
  )
}

export default AmountWithShare
