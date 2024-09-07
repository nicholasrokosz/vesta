import { Flex, Text, Image } from '@mantine/core'

interface Props {
  channel: string | undefined
  showText?: boolean
  grayscale?: boolean
  size?: 'sm' | 'lg'
}

const ChannelTag = ({ channel, showText, grayscale, size = 'lg' }: Props) => {
  const getLogo = () => {
    const c = channel?.toLowerCase()
    const width = size == 'sm' ? 18 : 24
    switch (c) {
      case 'airbnb':
        return (
          <Image
            miw={width}
            maw={width}
            fit={'fill'}
            src={`/icon-airbnb${grayscale ? '-grayscale' : ''}.svg`}
            alt="Airbnb"
          />
        )
      case 'vrbo':
        return (
          <Image
            miw={width}
            maw={width}
            fit="fill"
            src={`/icon-vrbo${grayscale ? '-grayscale' : ''}.svg`}
            alt="VRBO"
          />
        )
      case 'booking':
        return (
          <Image
            miw={width}
            maw={width}
            fit="fill"
            src={`/icon-booking${grayscale ? '-grayscale' : ''}.svg`}
            alt="Booking.com"
          />
        )
      case 'direct':
        return (
          <Image
            miw={width}
            maw={width}
            fit="fill"
            src={`/icon-direct.svg`}
            alt="Direct booking"
          />
        )
      default:
        return <></>
    }
  }

  if (showText) {
    return (
      <Flex direction={'row'} justify={'flex-start'} align={'center'}>
        {getLogo()}
        {showText && (
          <Text ml={4}>
            {channel?.toLowerCase() == 'booking' ? 'Booking.com' : channel}
          </Text>
        )}
      </Flex>
    )
  } else {
    return getLogo()
  }
}

export default ChannelTag
