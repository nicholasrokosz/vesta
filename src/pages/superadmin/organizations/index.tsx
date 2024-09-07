import { type NextPage } from 'next'
import { Space, List } from '@mantine/core'
import { api } from 'utils/api'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import Link from 'next/link'
import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'

const Index: NextPage = () => {
  const organizations = api.organizations.getAll.useQuery()

  return (
    <>
      <Breadcrumbs
        links={[
          { title: 'Super admin', href: '/superadmin/' },
          { title: 'Organizations' },
        ]}
      />
      <Space h="xl" />
      <VestaSpinnerOverlay visible={organizations.isLoading} />
      {!organizations.isLoading && (
        <>
          <List>
            {organizations.data?.map((organization) => (
              <List.Item key={organization.id}>
                <Link href={`/superadmin/organizations/${organization.id}`}>
                  {organization.name}
                </Link>
              </List.Item>
            ))}
          </List>
        </>
      )}
    </>
  )
}

export default Index
