import { useState } from 'react'
import {
  createStyles,
  Stack,
  Textarea,
  Button,
  Flex,
  Loader,
  Center,
  CopyButton,
  ActionIcon,
} from '@mantine/core'
import type { ChatCompletionRequestMessage } from 'openai'
import { api } from 'utils/api'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import type { IMessageThread } from 'types/messages'

const useStyles = createStyles((theme) => ({
  message: {
    padding: 10,
  },
  userMessage: {
    backgroundColor: theme.colors.blue[0],
  },
  botMessage: {
    backgroundColor: theme.colors.green[0],
  },
}))

const GptDialogue = ({
  listingId,
  thread,
}: {
  editBotResponse: (message: string) => void
  listingId: string
  thread: IMessageThread
}) => {
  const { classes, cx } = useStyles()

  const latestGuestMessage = thread.messages
    .filter(({ user }) => user === 'GUEST')
    .reverse()[0].message
  const startingText = `The guest said "${latestGuestMessage}". How should I respond?`

  const [prompt, setPrompt] = useState(startingText)
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([])

  const { refetch: getBotResponse } = api.messages.getGPTChatResponse.useQuery(
    {
      listingId: listingId,
      prompts: [...messages, { role: 'user', content: String(prompt) }],
      messageThreadId: thread.id,
    },
    { enabled: false }
  )

  const generateResponse = async () => {
    setIsLoading(true)

    const { data: botResponse } = await getBotResponse()
    setMessages([
      ...messages,
      { role: 'user', content: prompt },
      { role: 'assistant', content: String(botResponse) },
    ])

    setIsLoading(false)
    setPrompt('')
  }

  return (
    <Stack>
      {messages.map((message, i) => (
        <Flex
          direction="column"
          key={i}
          className={cx(classes.message, {
            [classes.userMessage]: message.role === 'user',
            [classes.botMessage]: message.role === 'assistant',
          })}
        >
          <b>{message.role === 'user' ? 'User' : 'Bot'}:</b> {message.content}
          {message.role === 'assistant' && (
            <>
              <br />
              <CopyButton
                value={
                  message.content
                    ? message.content
                    : 'Unable to generate a response right now. Please try again later.'
                }
              >
                {({ copied, copy }) => (
                  <Flex
                    direction={'row'}
                    justify={'flex-start'}
                    align={'center'}
                  >
                    <ActionIcon onClick={copy}>
                      {copied ? (
                        <IconCheck size="1.25rem" />
                      ) : (
                        <IconCopy size="1.25rem" />
                      )}
                    </ActionIcon>
                    <span onClick={copy}>Copy</span>
                  </Flex>
                )}
              </CopyButton>
            </>
          )}
        </Flex>
      ))}
      {isLoading && (
        <Center>
          <Loader size="lg" variant="dots" />
        </Center>
      )}
      <Textarea
        value={prompt}
        autosize
        onChange={(event) => setPrompt(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && event.ctrlKey == true) {
            setPrompt(prompt + '\n')
          } else if (event.key === 'Enter' && event.shiftKey == false) {
            event.preventDefault()
            void generateResponse()
          }
        }}
      />
      {/* eslint-disable @typescript-eslint/no-misused-promises */}
      <Button type="submit" onClick={generateResponse}>
        Generate response
      </Button>
    </Stack>
  )
}

export default GptDialogue
