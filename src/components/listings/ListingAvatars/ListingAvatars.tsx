import { Avatar, Tooltip } from '@mantine/core'
import vestaPhotoUtil from 'utils/vestaPhoto'
import { v4 as uuidv4 } from 'uuid'

interface Props {
  listings: { name: string; photo: string }[]
}

const ListingAvatars = ({ listings }: Props) => {
  const avatars = listings.slice(0, 4).map((listing) => {
    return (
      <Tooltip key={uuidv4()} label={listing.name} withArrow>
        <Avatar
          src={vestaPhotoUtil.getSmall(listing.photo)}
          alt={listing.name}
          radius="xl"
        />
      </Tooltip>
    )
  })
  const otherListings = listings.slice(4).map((listing) => {
    return <div key={uuidv4()}>{listing.name}</div>
  })

  return (
    <Avatar.Group spacing="sm">
      {avatars}
      {listings.length > 4 && (
        <Tooltip withArrow label={<div>{otherListings}</div>}>
          <Avatar radius="xl">+{listings.length - 4}</Avatar>
        </Tooltip>
      )}
    </Avatar.Group>
  )
}

export default ListingAvatars
