import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { createStyles, Space, Tabs, Text } from '@mantine/core'
import { showNotification } from '@mantine/notifications'

import Amenities from 'components/listings/new/Amenities/Amenities'
import Availability from 'components/listings/new/Availability'
import Content from 'components/listings/new/Content/Content'
import Details from 'components/listings/new/Details'
import BusinessModel from 'components/listings/new/BusinessModel/BusinessModel'
import Pricing from 'components/listings/new/Pricing'
import Rules from 'components/listings/new/Rules'
import Review from 'components/listings/new/Review'
import { api } from 'utils/api'

const useStyles = createStyles((theme) => ({
  link: {
    textDecoration: 'none',
    color: theme.colors.gray[8],
    fontSize: '1rem',
    fontWeight: 'bold',
  },
}))

interface Props {
  listingId: string
  isPublished?: boolean
  setListingId: (listingId: string) => void
}

const NewListingSteps = ({ listingId, setListingId, isPublished }: Props) => {
  const router = useRouter()
  const { classes } = useStyles()
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [tabList, setTabList] = useState<[string, string][]>([])

  const stepComplete = (step: number, newListingId?: string) => {
    const nextStep = tabList[step + 1]

    if (tabList.length > step + 1)
      void router.push(
        `/listings/new/${nextStep[0]}/${newListingId ?? listingId ?? ''}`
      )
  }

  const { data } = api.user.getRole.useQuery()

  useEffect(() => {
    if (!router.query?.step) return
    const params = router.query.step as string[]
    if (params.length > 1) setListingId(params[1])
    setActiveTab(params[0])
  }, [router.query])

  useEffect(() => {
    const tabList: [string, string][] = [
      ['details', 'Details'],
      ['amenities', 'Amenities'],
      ['content', 'Content'],
      ['rules', 'Rules'],
      ['availability', 'Availability'],
      ['pricing', 'Pricing'],
      ['business', 'Business Model'],
    ]

    if (data && data.globalRole === 'SUPERADMIN') {
      tabList.push(['review', 'Review & Publish'])
    }

    setTabList(tabList)
  }, [data])

  const tabs = tabList.map((tab, key) => {
    const disabled = !listingId && tab[0] !== 'details'
    return (
      <Tabs.Tab value={tab[0]} key={key} disabled={disabled}>
        {!disabled && (
          <Link href={`${tab[0]}/${listingId}`} className={classes.link}>
            {tab[1]}
          </Link>
        )}
        {disabled && <Text className={classes.link}>{tab[1]}</Text>}
      </Tabs.Tab>
    )
  })

  const getTabContent = (tab: string, key: number) => {
    const onSuccess = (newListingId?: string) => {
      if (!isPublished) {
        stepComplete(key, newListingId)
      } else {
        showNotification({
          title: '',
          message: 'The listing was saved successfully!',
          color: 'teal',
        })
      }
    }

    const onError = () => {
      showNotification({
        title: '',
        message: 'There was an error saving the listing. Please try again.',
        color: 'red',
      })
    }

    const buttonText = isPublished ? 'Save' : 'Save and Continue'

    switch (tab) {
      case 'details': {
        return (
          <Details
            listingId={listingId}
            onSuccess={onSuccess}
            onError={onError}
            buttonText={buttonText}
          />
        )
      }
      case 'amenities': {
        return (
          <Amenities
            listingId={listingId}
            onSuccess={onSuccess}
            onError={onError}
            buttonText={buttonText}
          />
        )
      }
      case 'content': {
        return (
          <Content
            listingId={listingId}
            onSuccess={onSuccess}
            onError={onError}
            buttonText={buttonText}
          />
        )
      }
      case 'rules': {
        return (
          <Rules
            listingId={listingId}
            onSuccess={onSuccess}
            onError={onError}
            buttonText={buttonText}
          />
        )
      }
      case 'availability': {
        return (
          <Availability
            listingId={listingId}
            onSuccess={onSuccess}
            onError={onError}
            buttonText={buttonText}
          />
        )
      }
      case 'pricing': {
        return (
          <Pricing
            listingId={listingId}
            onSuccess={onSuccess}
            onError={onError}
            buttonText={buttonText}
          />
        )
      }
      case 'business': {
        return (
          <BusinessModel
            listingId={listingId}
            onSuccess={onSuccess}
            onError={onError}
            buttonText={buttonText}
          />
        )
      }
      case 'review': {
        return <Review listingId={listingId} onSuccess={onSuccess} />
      }
    }
  }

  const tabPanels = tabList.map((tab, key) => {
    return (
      <Tabs.Panel value={tab[0]} key={key}>
        {getTabContent(tab[0], key)}
      </Tabs.Panel>
    )
  })

  return (
    <Tabs value={activeTab} onTabChange={setActiveTab} keepMounted={false}>
      <Tabs.List>{tabs}</Tabs.List>
      <Space h="lg" />
      {tabPanels}
    </Tabs>
  )
}

export default NewListingSteps
