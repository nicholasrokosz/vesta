import { Button, Flex, Stack, Text } from '@mantine/core'
import type { StripeConnection } from '@prisma/client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { api } from 'utils/api'
import { useRouter } from 'next/router'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'

const StripeTab = () => {
  const router = useRouter()

  const { data: connectionData, isLoading: fetchingConnectionData } =
    api.stripe.getConnection.useQuery(undefined, {})

  const [connection, setConnection] = useState<StripeConnection | null>(null)
  useEffect(() => {
    if (connectionData) {
      setConnection(connectionData)
    }
  }, [connectionData])

  const authorizeMutation = api.stripe.authorize.useMutation()
  const [authUrl, setAuthUrl] = useState<string | null>(null)
  useEffect(() => {
    if (authorizeMutation.isSuccess) {
      void router.push(authorizeMutation.data.url)
      setTimeout(() => {
        setAuthUrl(authorizeMutation.data.url)
      }, 2000)
    }
  }, [authorizeMutation.isSuccess])

  const authorize = () => {
    setAuthUrl(null)
    void authorizeMutation.mutate()
  }

  return (
    <Stack spacing="lg" maw={1200}>
      <Flex justify="space-between">
        <Stack spacing="xxxs">
          <Text fz="lg" fw="bold">
            Stripe connection
          </Text>
          <Text c="gray">
            Connecting Stripe allows you to accept payments for direct bookings.
          </Text>

          {!connection?.detailsSubmitted ? (
            <Stack>
              <VestaSpinnerOverlay
                visible={
                  authorizeMutation.isLoading || authorizeMutation.isSuccess
                }
              />
              <Button
                onClick={() => authorize()}
                disabled={fetchingConnectionData}
              >
                Connect Stripe account
              </Button>
              {!!authUrl && (
                <Link href={authUrl}>
                  Click to authorize if page does not reload
                </Link>
              )}
            </Stack>
          ) : (
            <Text>Stripe was successfully connected.</Text>
          )}
        </Stack>
      </Flex>
    </Stack>
  )
}

export default StripeTab
