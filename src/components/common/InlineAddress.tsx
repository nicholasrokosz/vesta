import type { MantineSize } from '@mantine/core'
import { Text } from '@mantine/core'
import type { IAddress } from 'types'

interface InlineAddressProps {
  address: IAddress
  size: MantineSize
}

const InlineAddress = ({ address, size = 'lg' }: InlineAddressProps) => {
  const { line1, line2, city, state, zip } = address

  return (
    <Text my={0} fz={size}>{`${line1}, ${
      line2 ? ` ${line2},` : ''
    } ${city}, ${state} ${zip}`}</Text>
  )
}

export default InlineAddress
