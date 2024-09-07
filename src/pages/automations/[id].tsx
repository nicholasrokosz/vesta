import { useEffect } from 'react'
import { type NextPage } from 'next'
import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'
import { api } from 'utils/api'
import { useRouter } from 'next/router'
import type { MessageTemplateCreate } from 'types/automations'
import NewMessageTemplate from 'components/automations/new'
import { showNotification } from '@mantine/notifications'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'

const Edit: NextPage = () => {
  const router = useRouter()
  const mutation = api.automations.upsertMessageTemplate.useMutation()

  const messageTemplateId = String(router.query.id)
  const messageTemplate = api.automations.getOne.useQuery(
    {
      id: messageTemplateId,
    },
    { enabled: messageTemplateId !== 'undefined' }
  )

  useEffect(() => {
    if (mutation.isSuccess) {
      void messageTemplate.refetch()
      void router.push('/automations')
      showNotification({
        title: '',
        message: 'Template saved!',
        color: 'teal',
      })
    }
  }, [mutation.isSuccess])

  return (
    <>
      <Breadcrumbs
        links={[
          { title: 'Automations', href: '/automations' },
          { title: messageTemplate?.data?.title ?? '' },
        ]}
      />
      <VestaSpinnerOverlay
        visible={messageTemplate.isLoading || mutation.isLoading}
      />

      <NewMessageTemplate
        messageTemplate={messageTemplate.data}
        onSubmit={(messageTemplate: MessageTemplateCreate) => {
          mutation.mutate(messageTemplate)
        }}
      />
    </>
  )
}

export default Edit
