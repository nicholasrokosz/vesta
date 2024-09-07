import { Image } from '@mantine/core'
import { SpotlightProvider } from '@mantine/spotlight'
import type { SpotlightAction } from '@mantine/spotlight'
import { IconHome, IconSearch } from '@tabler/icons-react'
import router from 'next/router'
import { api } from 'utils/api'
import { getPhoto } from 'utils/vesta'
import type { ReactNode } from 'react'

const VestaSpotlightProvider = ({ children }: { children: ReactNode }) => {
  const fiveMinutes = 1000 * 60 * 5
  const { data: listings } = api.listing.getAll.useQuery(undefined, {
    staleTime: fiveMinutes,
    refetchOnWindowFocus: false,
  })

  if (!listings) return <>{children}</>

  const actions: SpotlightAction[] = listings.map(
    ({ id, name, content, line1, line2, city, state, zip }) => ({
      title: name,
      description: `${line1}, ${
        line2 ? ` ${line2},` : ''
      } ${city}, ${state} ${zip}`,
      onTrigger: () => router.push(`/listings/${id}`),
      icon: content?.photos[0] ? (
        <Image
          withPlaceholder
          src={getPhoto(content.photos[0]).small}
          width={60}
          height={60}
          alt="Small picture of the unit"
          radius="50%"
        />
      ) : (
        <IconHome size="1.2rem" />
      ),
    })
  )

  return (
    <SpotlightProvider
      actions={actions}
      searchIcon={<IconSearch size="1.2rem" />}
      searchPlaceholder="Jump to listing..."
      shortcut="mod + k"
      nothingFoundMessage="Nothing found..."
    >
      {children}
    </SpotlightProvider>
  )
}

export default VestaSpotlightProvider
