import { Stack, Text } from '@mantine/core'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import type { StripeAuthorizationConfirmation } from 'server/api/routers/stripe'
import { api } from 'utils/api'

const StripeConfirmation = () => {
  const router = useRouter()

  const [response, setResponse] =
    useState<StripeAuthorizationConfirmation | null>(null)

  const { data: confirmationResponse } =
    api.stripe.confirmAuthorization.useQuery(undefined, {
      enabled: !response,
    })

  useEffect(() => {
    if (confirmationResponse) {
      if (confirmationResponse.success) {
        void router.push('/admin/stripe')
        setTimeout(() => {
          setResponse(confirmationResponse)
        }, 2000)
      } else {
        setResponse(confirmationResponse)
      }
    }
  }, [confirmationResponse])

  return (
    <Stack spacing="lg" maw={1200}>
      <Stack spacing="xxxs">
        <Text fz="lg" fw="bold">
          Confirming Strip connection...
        </Text>
        <Text c="gray">
          Thanks for connecting your Stripe account. We&apos;re just confirming
          everything&apos;s ok...
        </Text>
      </Stack>
      {!!response && !response.success && (
        <Stack spacing="xxxs">
          <Text c="red">Something went wrong. Please try reconnecting.</Text>
          <Link href={'/admin/stripe'}>Reconnect Stripe</Link>
        </Stack>
      )}
      {!!response && response.success && (
        <Stack spacing="xxxs">
          <Text c="gray">Stripe successfully connected!</Text>
          <Link href={'/admin/stripe'}>Continue</Link>
        </Stack>
      )}
    </Stack>
  )
}

export default StripeConfirmation
