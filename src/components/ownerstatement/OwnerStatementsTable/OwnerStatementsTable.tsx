import Link from 'next/link'
import {
  ActionIcon,
  Group,
  Space,
  Stack,
  Table,
  Text,
  createStyles,
} from '@mantine/core'
import { useToggle } from '@mantine/hooks'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { v4 as uuidv4 } from 'uuid'
import type { IOwnerStatementListItem } from 'types/ownerstatement'
import { DateTime } from 'luxon'

const useStyles = createStyles((theme) => ({
  th: {
    border: 'none !important',
  },
  link: {
    '&:hover': {
      cursor: 'pointer',
    },
    textDecoration: 'none',
    color: theme.colors.grape[7],
  },
  owner: {
    fontWeight: 700,
    backgroundColor: theme.colors.gray[1],
    color: theme.colors.gray[6],
    border: 'none !important',
  },
  property: {
    fontWeight: 700,
    color: theme.colors.gray[9],
    border: 'none !important',
  },
  statement: {
    fontWeight: 600,
    backgroundColor: theme.colors.gray[1],
    border: '1px solid',
    borderColor: theme.colors.gray[2],
  },
  spacer: {
    color: theme.colors.gray[1],
  },
}))

interface Props {
  owners: {
    name: string | null
    listings: {
      id: string
      name: string
      statements: IOwnerStatementListItem[]
    }[]
  }[]
  ownerPortal: boolean
  filterByListing?: string
}

const OwnerStatementRow = (item: IOwnerStatementListItem) => {
  const { classes } = useStyles()

  const urlBase = item.ownerPortal
    ? '/owner/statements'
    : '/financials/ownerstatements'

  const url =
    item.isLocked && item.id
      ? `${urlBase}/${item.id}`
      : `${urlBase}/draft/${item.listingId}/${item.year}/${item.month}`

  return (
    <tr>
      <td className={classes.statement}>
        <Group>
          <Space w="xl" />
          <Link href={url} className={classes.link}>
            {`${
              DateTime.fromObject({ month: item.month, year: item.year })
                .monthLong
            } ${item.year}`}
            {!item.isLocked && ' (draft)'}
          </Link>
        </Group>
      </td>
    </tr>
  )
}

const OwnerListingRow = ({
  name,
  statements,
  ownerPortal,
}: {
  name: string | null
  statements: IOwnerStatementListItem[]
  ownerPortal: boolean
}) => {
  const [open, toggleOpen] = useToggle([false, true])
  const { classes } = useStyles()
  return (
    <>
      <tr className={classes.property}>
        <td className={classes.property}>
          <Group>
            <ActionIcon onClick={() => toggleOpen()}>
              {open && <IconChevronDown size="1.125rem" />}
              {!open && <IconChevronRight size="1.125rem" />}
            </ActionIcon>
            <Text onClick={() => toggleOpen()}>{name}</Text>
          </Group>
        </td>
      </tr>

      {open &&
        statements.map((statement) => (
          <OwnerStatementRow
            key={uuidv4()}
            {...statement}
            ownerPortal={ownerPortal}
          />
        ))}
    </>
  )
}

const PropertyOwnerRow = ({
  name,
  listings,
  ownerPortal,
}: {
  name: string | null
  listings: {
    id: string
    name: string | null
    statements: IOwnerStatementListItem[]
  }[]
  ownerPortal: boolean
}) => {
  const { classes } = useStyles()

  return (
    <>
      {!ownerPortal && (
        <tr>
          <td className={classes.owner} colSpan={2}>
            <Text>{name}</Text>
          </td>
        </tr>
      )}

      {listings.map((listing) => (
        <OwnerListingRow
          key={uuidv4()}
          {...listing}
          ownerPortal={ownerPortal}
        />
      ))}
    </>
  )
}

const OwnerStatementsTable = ({ owners, ownerPortal }: Props) => {
  const { classes } = useStyles()

  const COLUMNS = ['Listing']

  return (
    <Stack>
      <Table>
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th className={classes.th} key={uuidv4()}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {owners.map((owner) => (
            <PropertyOwnerRow
              key={uuidv4()}
              ownerPortal={ownerPortal}
              {...owner}
            />
          ))}
        </tbody>
      </Table>
    </Stack>
  )
}

export default OwnerStatementsTable
