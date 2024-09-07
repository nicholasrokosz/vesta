import { ServerClient } from 'postmark'
import type { MessageSendingResponse } from 'postmark/dist/client/models'

interface PostmarkSendEmailArgs {
  to: string
  from?: string | undefined
  bcc?: string | undefined
  subject: string
  htmlBody: string
  textBody: string
  replyTo?: string | undefined
}

export class PostmarkService {
  private readonly client: ServerClient

  public constructor(apiKey: string) {
    this.client = new ServerClient(apiKey)
  }

  public async sendEmail(
    input: PostmarkSendEmailArgs
  ): Promise<MessageSendingResponse | null> {
    return await this.client.sendEmail({
      From: input.from ?? process.env.POSTMARK_FROM_ADDRESS ?? '',
      To: input.to,
      Bcc: input.bcc,
      ReplyTo: input.replyTo,
      Subject: input.subject,
      HtmlBody: input.htmlBody,
      TextBody: input.textBody,
      MessageStream: 'outbound',
    })
  }
}

export default PostmarkService
