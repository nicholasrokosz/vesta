import React, { useEffect, useState } from 'react'
import {
  Button,
  createStyles,
  Flex,
  Stack,
  Text,
  Badge,
  Table,
} from '@mantine/core'
import { api } from 'utils/api'
import VestaModal from 'components/common/Modal/Modal'
import Link from 'next/link'
import PlaidLink from 'components/plaid/link/PlaidLink'

const useStyles = createStyles((theme) => ({
  header: {
    fontStyle: 'normal',
    fontWeight: 700,
    fontSize: 26,
    lineHeight: '135%',
  },
  institution: {
    borderRadius: 6,
    backgroundColor: theme.colors.gray[1],
    padding: theme.spacing.md,
  },
}))

const PlaidTab = () => {
  const { classes } = useStyles()
  const plaidItems = api.plaid.getItems.useQuery()
  const plaidItemMutation = api.plaid.saveItem.useMutation()
  const syncTransactionsMutation = api.plaid.syncTransactions.useMutation()

  useEffect(() => {
    if (plaidItemMutation.isSuccess) {
      void plaidItems.refetch()
      void syncTransactionsMutation.mutate()
    }
  }, [plaidItemMutation.isSuccess])

  const [modalOpen, setModalOpen] = useState(false)

  return (
    <Stack spacing="lg" maw={1200}>
      <Flex justify="space-between">
        <Stack spacing="xxxs">
          <Text fz="lg" fw="bold">
            Plaid connection
          </Text>
          <Text c="gray">
            Plaid allows you to get invoices from your bank account.
          </Text>
        </Stack>
        <PlaidLink onSuccess={plaidItemMutation.mutate} />
      </Flex>
      {plaidItems.data?.map((item) => (
        <Stack key={item.id} className={classes.institution}>
          <Flex>
            <Text fz="lg" fw={600}>
              {item.institution}
            </Text>
            <Badge ml="xl" size="lg" radius="sm" color="green">
              Connected
            </Badge>
            <Flex></Flex>
          </Flex>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Number</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {item.accounts.map((account) => (
                <tr key={account.id}>
                  <td width="25%">{account.name}</td>
                  <td width="25%">{account.subtype}</td>
                  <td width="25%">**** {account.mask}</td>
                  <td width="25%" align="right">
                    <Button onClick={() => setModalOpen(true)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <VestaModal
            title="Contact Support"
            onClose={() => setModalOpen(false)}
            opened={modalOpen}
          >
            <Stack spacing="md">
              <Text>
                Please contact{' '}
                <Link href="mailto:help@getvesta.io">Vesta support</Link> to
                delete this connection.
              </Text>
            </Stack>
          </VestaModal>
        </Stack>
      ))}
    </Stack>
  )
}

export default PlaidTab
