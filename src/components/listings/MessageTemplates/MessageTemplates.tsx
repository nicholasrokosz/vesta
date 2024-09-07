import { createStyles, Table, Text } from '@mantine/core'
import router from 'next/router'

import { v4 as uuidv4 } from 'uuid'

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.colors.gray[1],
  },
  th: {
    border: 'none !important',
  },
  link: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}))

interface Props {
  templates: {
    id: string
    title: string
    trigger: string
  }[]
}

const MessageTemplates = ({ templates }: Props) => {
  const { classes } = useStyles()

  const COLUMNS = ['Message title', 'Trigger']

  return (
    <Table highlightOnHover>
      <thead className={classes.header}>
        <tr>
          {COLUMNS.map((column) => (
            <th className={classes.th} key={uuidv4()}>
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {templates.map((template) => (
          <tr key={template.id}>
            <td
              className={classes.link}
              onClick={() =>
                void router.push(`/automations/${template.id ?? ''}`)
              }
            >
              {template.title}
            </td>
            <td>
              {template.trigger ? (
                template.trigger
              ) : (
                <Text italic>No trigger</Text>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default MessageTemplates
