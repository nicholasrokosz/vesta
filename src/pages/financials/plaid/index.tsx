/* eslint-disable @typescript-eslint/no-unsafe-return */
import { type NextPage } from 'next'
import { Space, List, Text } from '@mantine/core'
import { api } from 'utils/api'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'
import React from 'react'
import PlaidLink from 'components/plaid/link/PlaidLink'

const Index: NextPage = () => {
  const plaidItems = api.plaid.getItems.useQuery()
  const plaidItemMutation = api.plaid.saveItem.useMutation()

  return (
    <>
      <Breadcrumbs links={[{ title: 'Plaid accounts' }]} />
      <Space h="xl" />
      <PlaidLink onSuccess={plaidItemMutation.mutate} />
      <VestaSpinnerOverlay
        visible={plaidItems.isLoading || plaidItemMutation.isLoading}
      />
      {!plaidItems.isLoading && (
        <>
          <List>
            {plaidItems.data?.map((item) => (
              <List.Item key={item.id}>
                <Text>
                  {item.institution} ({item.creator.name})
                </Text>
                <List>
                  {item.accounts.map((account) => (
                    <List.Item key={account.id}>
                      <Text>
                        {account.name} [{account.type} : {account.subtype}] (
                        {account.mask})
                      </Text>
                    </List.Item>
                  ))}
                </List>
              </List.Item>
            ))}
          </List>
        </>
      )}
    </>
  )
}

export default Index
