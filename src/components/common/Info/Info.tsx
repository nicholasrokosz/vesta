import { Tooltip } from '@mantine/core'
import type { TooltipProps } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'

const Info = ({ label, ...rest }: Omit<TooltipProps, 'children'>) => (
  <Tooltip
    label={label}
    position="top-start"
    maw={500}
    multiline
    withArrow
    {...rest}
  >
    <IconInfoCircle size={14} />
  </Tooltip>
)

export default Info
