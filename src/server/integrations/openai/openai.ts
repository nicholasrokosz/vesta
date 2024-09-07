import { Configuration, OpenAIApi } from 'openai'
import type { ChatCompletionRequestMessage } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export const sendPrompt = async function (
  prompts: ChatCompletionRequestMessage[],
  threadString: string,
  systemPrompt: string | undefined | null
) {
  const messages: ChatCompletionRequestMessage[] = [
    {
      role: 'system',
      content:
        'You are a helpful, friendly property manager that responds to incoming messages from guests staying at one of your properties.',
    },
    {
      role: 'system',
      content: `Here is some specific information about the property that the guest is staying at: ${
        systemPrompt ?? 'No specific property information was provided.'
      }`,
    },
    {
      role: 'system',
      content: `Here is the conversation between the property manager and the guest, to be used to inform future responses to the guest: ${threadString}`,
    },
    {
      role: 'system',
      content: 'Do not preface responses with a role',
    },
    ...prompts,
  ]

  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    temperature: 0.1,
    messages: messages,
  })

  return completion.data.choices[0].message?.content ?? 'No response'
}
