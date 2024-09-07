import { ActionIcon, Flex } from '@mantine/core'
import RevenueCell from './RevenueCell'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import type { ReactNode, SetStateAction } from 'react'

interface Props {
  label: string | ReactNode
  open: boolean
  toggleOpen: (value?: SetStateAction<boolean> | undefined) => void
}

const RevenueActionCell = ({ label, open, toggleOpen }: Props) => (
  <RevenueCell>
    <Flex style={{ position: 'relative', right: 6 }}>
      <>
        <ActionIcon size="sm" onClick={() => toggleOpen()}>
          {open ? <IconChevronDown /> : <IconChevronRight />}
        </ActionIcon>
        {label}
      </>
    </Flex>
  </RevenueCell>
)

export default RevenueActionCell
