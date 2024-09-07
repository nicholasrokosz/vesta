import { Text, Avatar, createStyles, Flex, Space, Image } from '@mantine/core'
import type { MessageUser } from '@prisma/client'
import { addLineBreaks } from 'utils/text'

const useStyles = createStyles((theme) => ({
  guest: {
    backgroundColor: theme.colors.gray[1],
  },
  propertyManager: {
    // TODO: Redo Mantine theme config
    backgroundColor: '#F3ECFE',
  },
}))

interface Props {
  text: string
  sender: MessageUser
}

const Message = ({ text, sender }: Props) => {
  const { classes } = useStyles()
  const isGuest = sender === 'GUEST'

  return (
    <>
      <Flex
        direction={isGuest ? 'row' : 'row-reverse'}
        align={isGuest ? 'flex-start' : 'flex-end'}
      >
        <Avatar src={null} alt="User Avatar" color="vesta" size="md" radius={4}>
          {!isGuest && (
            <Image
              p={5}
              fit="scale-down"
              src="/vesta-user-icon.svg"
              alt="Vesta logo"
            />
          )}
        </Avatar>
        <Space w="xs" />
        <Text
          p={16}
          w="fit-content"
          sx={{ borderRadius: 8 }}
          className={isGuest ? classes.guest : classes.propertyManager}
        >
          {addLineBreaks(text)}
        </Text>
      </Flex>
      <Space h="xl" />
    </>
  )
}

export default Message
