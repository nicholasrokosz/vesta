import { useEffect } from 'react'
import { type NextPage } from 'next'
import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'
import { api } from 'utils/api'
import { useRouter } from 'next/router'
import type { MessageTemplateCreate } from 'types/automations'
import NewMessageTemplate from 'components/automations/new'
import { showNotification } from '@mantine/notifications'

const New: NextPage = () => {
  const router = useRouter()
  const mutation = api.automations.upsertMessageTemplate.useMutation()

  useEffect(() => {
    if (mutation.isSuccess) {
      showNotification({
        title: '',
        message: 'Template created!',
        color: 'teal',
      })
      void router.push('/automations')
    }
  }, [mutation])

  return (
    <>
      <Breadcrumbs
        links={[
          { title: 'Automations', href: '/automations' },
          { title: 'New Message Template' },
        ]}
      />
      <NewMessageTemplate
        onSubmit={(messageTemplate: MessageTemplateCreate) => {
          mutation.mutate(messageTemplate)
        }}
      />
    </>
  )
}

export default New
