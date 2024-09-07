import React from 'react'
import { createStyles } from '@mantine/core'
import { RevenueCellFormat } from './types'

const useStyles = createStyles(() => ({
  currency: {
    textAlign: 'right',
    paddingRight: 8,
  },
}))

interface Props {
  children?: React.ReactNode
  format?: RevenueCellFormat
}

const RevenueCell = ({
  children,
  format = RevenueCellFormat.String,
}: Props) => {
  const { classes } = useStyles()

  return (
    <td
      width={format == RevenueCellFormat.Currency ? '20%' : '40%'}
      className={format == RevenueCellFormat.Currency ? classes.currency : ''}
    >
      {children}
    </td>
  )
}

export default RevenueCell
