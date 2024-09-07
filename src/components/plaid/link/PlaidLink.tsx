import { Button } from '@mantine/core'
import { api } from 'utils/api'
import { usePlaidLink, type PlaidLinkOptions } from 'react-plaid-link'
import { useEffect, useState } from 'react'
import type { PlaidLinkOnSuccessMetadata } from 'server/services/plaid/types'

interface Props {
  onSuccess: (data: PlaidLinkOnSuccessMetadata) => void
}

const PlaidLink = ({ onSuccess }: Props) => {
  const {
    data: linkToken,
    isLoading: fetchingLinkToken,
    refetch: tokenRefetch,
  } = api.plaid.createLinkToken.useQuery(undefined, {
    refetchInterval: 300000,
    refetchOnWindowFocus: false,
  })

  const [token, setToken] = useState<string | null>(null)
  useEffect(() => {
    if (linkToken) {
      setToken(linkToken)
    }
  }, [linkToken])

  const config: PlaidLinkOptions = {
    token,
    onSuccess: (publicToken, metadata) => {
      if (metadata.institution != null) {
        onSuccess({
          public_token: publicToken,
          institution: metadata.institution,
          accounts: metadata.accounts,
          link_session_id: metadata.link_session_id,
        })

        void tokenRefetch()
      }
    },
    onExit: (err, _metadata) => {
      console.log(`Link exited with error: ${err ? err.display_message : ''}`)
    },
    onEvent: (eventName, metadata) => {
      console.log('onEvent', eventName, metadata)
    },
  }

  const { open } = usePlaidLink(config)

  return (
    <Button onClick={() => void open()} disabled={fetchingLinkToken}>
      Connect new account
    </Button>
  )
}

export default PlaidLink
