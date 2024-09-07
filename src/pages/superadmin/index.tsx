import { type NextPage } from 'next'
import { Space, List } from '@mantine/core'
import Link from 'next/link'
import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'

const Index: NextPage = () => {
  return (
    <>
      <Breadcrumbs links={[{ title: 'Super admin' }]} />
      <Space h="xl" />
      <List>
        <List.Item key="organizations">
          <Link href={`/superadmin/organizations/`}>Organizations</Link>
        </List.Item>
      </List>
    </>
  )
}

export default Index
