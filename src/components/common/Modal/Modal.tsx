import { Modal, createStyles } from '@mantine/core'
import type { ModalProps } from '@mantine/core'

const useStyles = createStyles(() => ({
  visibleOverflow: {
    overflow: 'visible',
  },
}))

const VestaModal = ({ opened, onClose, children, ...rest }: ModalProps) => {
  const { classes } = useStyles()

  return (
    <Modal
      classNames={{
        root: classes.visibleOverflow,
        content: classes.visibleOverflow,
        body: classes.visibleOverflow,
      }}
      opened={opened}
      onClose={onClose}
      {...rest}
    >
      {children}
    </Modal>
  )
}

export default VestaModal
