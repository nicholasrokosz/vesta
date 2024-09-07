import { createStyles, Table, Text } from '@mantine/core'

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.colors.gray[1],
  },
  th: {
    border: 'none !important',
    paddingRight: 8,
  },
}))

interface Props {
  maxWidth?: number
  children: React.ReactNode[]
  hideShare?: boolean
}

const RevenueTable = ({ maxWidth, children, hideShare }: Props) => {
  const { classes } = useStyles()
  const columns = [
    {
      label: '',
      key: 'text',
      format: 'string',
    },
    {
      label: 'Total amount',
      key: 'totalAmount',
      format: 'currency',
    },
  ]

  if (!hideShare) {
    columns.push({
      label: 'Manager amount',
      key: 'managerAmount',
      format: 'currency',
    })
    columns.push({
      label: 'Owner amount',
      key: 'ownerAmount',
      format: 'currency',
    })
  }

  return (
    <Table fontSize="sm" maw={maxWidth || 900}>
      <thead className={classes.header}>
        <tr>
          {columns.map((column) => (
            <th className={classes.header} key={column.key}>
              <Text align={column.format == 'currency' ? 'right' : 'left'}>
                {column.label}
              </Text>
            </th>
          ))}
        </tr>
      </thead>

      <tbody>{children}</tbody>
    </Table>
  )
}

export default RevenueTable
