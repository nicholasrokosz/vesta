import React from 'react'
import { createStyles } from '@mantine/core'
import { RevenueRowType } from './types'

const useStyles = createStyles((theme) => ({
  header: {
    fontWeight: 'bold',
    backgroundColor: theme.colors.gray[1],
  },
  summary: {
    fontWeight: 'bold',
    borderTop: `5px solid ${theme.colors.gray[4]}`,
  },
  total: {
    fontWeight: 'bold',
    backgroundColor: theme.colors.gray[1],
    borderTop: `5px solid ${theme.colors.gray[4]}`,
  },
}))

interface Props {
  children: React.ReactNode
  type?: RevenueRowType
}

const RevenueRow = ({ children, type = RevenueRowType.Item }: Props) => {
  const { classes } = useStyles()

  return (
    <tr
      className={
        type == RevenueRowType.Summary
          ? classes.summary
          : type == RevenueRowType.Total
          ? classes.total
          : ''
      }
    >
      {children}
    </tr>
  )
}

export default RevenueRow
