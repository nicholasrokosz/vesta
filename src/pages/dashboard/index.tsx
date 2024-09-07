import { useState } from 'react'
import type { TabsValue } from '@mantine/core'
import { createStyles, Title, Tabs, Space } from '@mantine/core'

import { api } from 'utils/api'
import EventsTable from 'components/dashboard/EventsTable/EventsTable'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'

const useStyles = createStyles(() => ({
  header: {
    fontStyle: 'normal',
    fontWeight: 700,
    fontSize: 26,
    lineHeight: '135%',
  },
}))

const Dashboard = () => {
  const { data, isLoading } = api.calendar.getUpcoming.useQuery()

  const [activeTab, setSelectedTab] = useState<TabsValue>('Checkins')

  const { classes } = useStyles()

  return (
    <div>
      <Title order={1} className={classes.header}>
        Dashboard
      </Title>
      <Space h="lg" />
      <div className="loading-spinner-container">
        <Tabs defaultValue={activeTab} onTabChange={setSelectedTab}>
          <Tabs.List>
            <Tabs.Tab value="Checkins" fz="md">
              Check-ins
            </Tabs.Tab>
            <Tabs.Tab value="Checkouts" fz="md">
              Checkouts
            </Tabs.Tab>
          </Tabs.List>
          <Space h="lg" />
          <VestaSpinnerOverlay visible={isLoading} />
          <Tabs.Panel value="Checkins">
            <EventsTable events={data?.checkins || []} checkIn />
          </Tabs.Panel>
          <Tabs.Panel value="Checkouts">
            <EventsTable events={data?.checkouts || []} />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  )
}

export default Dashboard
