import { type NextPage } from 'next'
import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'
import { api } from 'utils/api'
import { usePlaidLink, type PlaidLinkOptions } from 'react-plaid-link'
import { useEffect, useState } from 'react'

const OAuth: NextPage = () => {
  const plaidItemMutation = api.plaid.saveItem.useMutation()

  const [token, setToken] = useState<string | null>(null)
  useEffect(() => {
    setToken(localStorage.getItem('plaidLinkToken'))
  }, [])

  const config: PlaidLinkOptions = {
    token,
    onSuccess: (publicToken, metadata) => {
      if (metadata.institution != null) {
        plaidItemMutation.mutate({
          public_token: publicToken,
          institution: metadata.institution,
          accounts: metadata.accounts,
          link_session_id: metadata.link_session_id,
        })
      }
    },
    onExit: (err, _metadata) => {
      console.log(`Link exited with error: ${err ? err.display_message : ''}`)
    },
    onEvent: (eventName, metadata) => {
      console.log('onEvent', eventName, metadata)
    },
  }

  const { open, ready } = usePlaidLink(config)

  useEffect(() => {
    if (ready) {
      open()
    }
  }, [ready, open])

  return (
    <>
      <Breadcrumbs links={[{ title: 'Plaid flow' }]} />
    </>
  )
}

export default OAuth
