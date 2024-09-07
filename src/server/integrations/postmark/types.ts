export interface PostmarkInboundMessage {
  FromName: string
  MessageStream: string
  From: string
  FromFull: {
    Email: string
    Name: string
    MailboxHash: string
  }
  To: string
  ToFull: {
    Email: string
    Name: string
    MailboxHash: string
  }[]
  Cc: string
  CcFull: {
    Email: string
    Name: string
    MailboxHash: string
  }[]
  Bcc: string
  BccFull: {
    Email: string
    Name: string
    MailboxHash: string
  }[]
  OriginalRecipient: string
  Subject: string
  MessageID: string
  ReplyTo: string
  MailboxHash: string
  Date: string
  TextBody: string
  HtmlBody: string
  StrippedTextReply: string
  RawEmail: string
  Tag: string
  Headers: {
    Name: string
    Value: string
  }[]
  Attachments: {
    Name: string
    ContentType: string
    Data: string
    ContentLength: number
  }[]
}
