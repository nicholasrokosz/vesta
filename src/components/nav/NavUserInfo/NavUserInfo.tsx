import { Flex, Avatar, Text } from '@mantine/core'

interface Props {
  name: string
  imgSrc?: string
}

const NavUserInfo = ({ name, imgSrc }: Props) => {
  return (
    <Flex justify="flex-start" align="center">
      <Avatar
        src={imgSrc ?? null}
        alt="no image here"
        color="vesta"
        size="lg"
        mr={12}
        sx={{ borderRadius: '50%' }}
      />
      <Flex direction="column" maw={200} wrap="wrap">
        <Text size={14} fw={700}>
          {name}
        </Text>
      </Flex>
    </Flex>
  )
}

export default NavUserInfo
