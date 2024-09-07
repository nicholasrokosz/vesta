import { LoadingOverlay } from '@mantine/core'
import type { LoadingOverlayProps } from '@mantine/core'

const VestaSpinnerOverlay = ({ ...props }: LoadingOverlayProps) => {
  return (
    <LoadingOverlay
      transitionDuration={500}
      loaderProps={{ pos: 'absolute', top: 128 }}
      {...props}
    />
  )
}

export default VestaSpinnerOverlay
