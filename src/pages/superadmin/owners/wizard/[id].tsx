import { type NextPage } from 'next'
import { api } from 'utils/api'
import { useRouter } from 'next/router'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import { createStyles } from '@mantine/core'

const useStyles = createStyles(() => ({
  iframe: {
    display: 'block',
    width: '100%',
    height: '100vh',
  },
}))

const View: NextPage = () => {
  const { classes } = useStyles()
  const router = useRouter()
  const ownerId = String(router.query.id)

  const wizardUrl = api.organizations.getWizardUrl.useQuery({
    id: ownerId,
  })

  return (
    <>
      <VestaSpinnerOverlay visible={wizardUrl.isLoading} />
      {wizardUrl?.data && (
        <iframe src={wizardUrl.data} className={classes.iframe}></iframe>
      )}
    </>
  )
}

export default View
