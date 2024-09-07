import { useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { MessagesLayout, MobileMessagesLayout } from 'components/messages'

const MessagesPage = () => {
  const theme = useMantineTheme()
  const mobileView = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

  return mobileView ? <MobileMessagesLayout /> : <MessagesLayout />
}

export default MessagesPage
