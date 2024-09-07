import React, { useState } from 'react'
import {
  createStyles,
  Group,
  Text,
  TextInput,
  Divider,
  Stack,
  Button,
  Title,
} from '@mantine/core'
import ListingCard from 'components/listings/ListingCard/ListingCard'
import ListingListToggle from 'components/listings/ListingListToggle/ListingListToggle'
import { api } from 'utils/api'
import { IconSearch } from '@tabler/icons-react'

const useStyles = createStyles((theme) => ({
  page: {
    padding: '1rem',
  },
  header: {
    fontStyle: 'normal',
    fontWeight: 700,
    fontSize: 26,
    lineHeight: '135%',
  },
  top: {
    marginTop: 60,
  },
  bottom: {
    marginBottom: 60,
  },
  count: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 700,
  },
  divider: {
    marginLeft: -24,
    marginRight: -24,
  },
}))

export default function IndexPage() {
  const listings = api.listing.getAll.useQuery().data ?? []
  const { classes } = useStyles()
  const [search, setSearch] = useState('')
  const [view, setView] = useState('card')

  const cards = (
    search
      ? listings.filter(
          ({ name }) =>
            name && name.toLowerCase().includes(search.toLowerCase())
        )
      : listings
  )
    .sort((a, b) => {
      if (!a.name || !b.name) return 0
      return a.name.localeCompare(b.name)
    })
    .map((listing, key) => (
      <ListingCard
        key={key}
        isCard={view === 'card'}
        listing={listing}
        photos={listing.content?.photos[0] ?? ''}
      />
    ))
  return (
    <div className={classes.page}>
      <Group position="apart">
        <Title order={1} className={classes.header}>
          Listings
        </Title>
        <Button component="a" href="/listings/new">
          Add new listing
        </Button>
      </Group>

      <Divider my="sm" className={classes.divider} />

      <Group position="apart">
        <Group>
          <Text className={classes.count}>{cards.length} Listings</Text>
          <TextInput
            aria-label="Search Listings"
            placeholder="Search Listings"
            icon={<IconSearch />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
        </Group>

        <ListingListToggle view={view} setView={setView} />
      </Group>
      <Divider my="sm" className={classes.divider} />

      {view === 'card' && (
        <div className={classes.top}>
          <Group spacing="md">{cards}</Group>
        </div>
      )}
      {view === 'list' && <Stack className={classes.bottom}>{cards}</Stack>}
    </div>
  )
}
