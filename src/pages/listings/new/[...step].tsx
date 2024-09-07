import { useState } from 'react'
import { Space } from '@mantine/core'
import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'
import NewListingSteps from 'components/nav/NewListingSteps/NewListingSteps'
import { api } from 'utils/api'

const Step = () => {
  const [listingId, setListingId] = useState<string>('')
  const listing = api.listing.getOne.useQuery({
    id: listingId ?? '',
  })

  return (
    <>
      <Breadcrumbs
        links={[
          { title: 'Listing', href: '/listings' },
          { title: listing.data?.name || 'New Listing' },
        ]}
      />
      <Space h="lg" />
      <NewListingSteps
        listingId={listingId}
        setListingId={setListingId}
        isPublished={listing.data?.bpProductId ? true : false}
      />
      <Space h="lg" />
    </>
  )
}

export default Step
