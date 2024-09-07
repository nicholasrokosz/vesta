import { Button } from '@mantine/core'
import { IconBolt } from '@tabler/icons-react'

interface Props {
  onClick: () => void
}

const InsertMessageTag = ({ onClick }: Props) => {
  return (
    <Button
      color={'#8434F4'}
      fz={'md'}
      onClick={(e) => {
        onClick()
        e.preventDefault()
      }}
      leftIcon={<IconBolt size={'1.5em'} />}
      variant="outline"
    >
      Add message tag
    </Button>
  )
}

export default InsertMessageTag
