import { Table, Text, createStyles, Switch } from '@mantine/core'
import { IconLink } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { v4 as uuidv4 } from 'uuid'
import { api } from 'utils/api'
import type { IMessageTemplate } from 'types/automations'
import { useState } from 'react'
import ListingAvatars from 'components/listings/ListingAvatars/ListingAvatars'

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
  automations: IMessageTemplate[]
}

const AutomationRow = ({ id, triggerName, ...template }: IMessageTemplate) => {
  const { classes } = useStyles()
  const router = useRouter()
  const [enabled, setEnabled] = useState(template.enabled)
  const mutation = api.automations.setEnabled.useMutation()

  return (
    <tr>
      <td>
        <Switch
          checked={enabled}
          onChange={(event) => {
            setEnabled(event.currentTarget.checked)
            mutation.mutate({ id, enabled: event.currentTarget.checked })
          }}
        />
      </td>
      <td
        className={classes.link}
        onClick={() => void router.push(`/automations/${id ?? ''}`)}
      >
        {template.title} <IconLink size="0.8rem" />
      </td>
      <td>{triggerName ? triggerName : <Text italic>No trigger</Text>}</td>
      <td>
        {template.allListings ? (
          <Text italic>All listings</Text>
        ) : (
          <ListingAvatars listings={template.listings} />
        )}
      </td>
    </tr>
  )
}

const AutomationsTable = ({ automations }: Props) => {
  const { classes } = useStyles()

  const COLUMNS = ['Status', 'Message Title', 'Trigger', 'Listings']

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
        {automations.map((automation) => (
          <AutomationRow key={uuidv4()} {...automation} />
        ))}
      </tbody>
    </Table>
  )
}

export default AutomationsTable
