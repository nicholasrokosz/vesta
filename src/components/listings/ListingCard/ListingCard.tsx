import {
  createStyles,
  Card,
  Text,
  Grid,
  Image,
  Stack,
  Center,
  Paper,
} from '@mantine/core'
import type { Listing } from '@prisma/client'
import Link from 'next/link'
import { formatAddress, getPhoto } from 'utils/vesta'

const useStyles = createStyles((theme) => ({
  body: {
    width: 176,
    height: 204,
    overflow: 'visible',
    marginBottom: 60,
    color: theme.colors.neutral[7],
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 700,
    lineHeight: '20px',
  },
  text: {
    lineHeight: '18px',
  },
  image: {
    marginTop: -47,
  },
  stack: {
    paddingTop: 13,
  },
  link: {
    textDecoration: 'none',
  },
}))

interface Props {
  isCard: boolean
  listing: Listing
  photos: string
}

const ListingCard = ({ isCard, listing, photos }: Props) => {
  const { classes } = useStyles()

  const photoUrl = photos ? getPhoto(photos).small : ''

  return (
    <Link href={`/listings/${listing.id}`} className={classes.link}>
      {isCard && (
        <Card
          className={classes.body}
          shadow="sm"
          p="lg"
          radius="md"
          withBorder
        >
          <Card.Section>
            <Center>
              <Image
                className={classes.image}
                withPlaceholder
                src={photoUrl}
                width={120}
                height={80}
                alt="Small picture of the unit"
                radius="sm"
              />
            </Center>
          </Card.Section>
          <Stack
            className={classes.stack}
            align="center"
            justify="flex-start"
            spacing="xs"
          >
            <Text className={classes.title} align="center" lineClamp={2}>
              {listing.name}
            </Text>

            <Text className={classes.text} align="center">
              {listing.unitType}
            </Text>

            <Text className={classes.text} align="center" lineClamp={2}>
              {formatAddress(listing)}
            </Text>
          </Stack>
        </Card>
      )}
      {!isCard && (
        <Paper shadow="none" radius="sm" p="sm" withBorder>
          <Grid grow>
            <Grid.Col span={2}>
              <Text className={classes.title}>{listing.name}</Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text className={classes.text}>
                {listing.unitType} • {formatAddress(listing)}
              </Text>
            </Grid.Col>
          </Grid>
        </Paper>
      )}
    </Link>
  )
}

export default ListingCard
