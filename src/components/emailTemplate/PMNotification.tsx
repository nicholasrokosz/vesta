import { DateTime } from 'luxon'

import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface Props {
  guestName: string
  listingName: string
  messageText: string
  messageTime: Date
  messageThreadId: string
}

export function PMNotification({
  guestName,
  listingName,
  messageText,
  messageTime,
  messageThreadId,
}: Props) {
  const previewText = `Read ${guestName}'s message`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>

      <Body style={main}>
        <Section style={main}>
          <Container style={container}>
            <Section>
              <Img
                src="https://app.getvesta.io/logo.png"
                width="100"
                height="26"
                alt="Vesta"
              />
            </Section>
            <Section style={{ paddingBottom: '20px' }}>
              <Row>
                <Text style={heading}>Message from {guestName}</Text>
                <Text style={listing}>{listingName}</Text>
                <Text style={review}>{messageText}</Text>
                <Text style={info}>
                  {DateTime.fromJSDate(messageTime).toFormat('LLL L, t')}
                </Text>
                <Button
                  pY={19}
                  style={button}
                  href={`${
                    process.env.APP_URL ?? ''
                  }/messages/all/${messageThreadId}`}
                >
                  Reply in Vesta
                </Button>
              </Row>
            </Section>

            <Hr style={hr} />

            <Section>
              <Row>
                <Link href="https://getvesta.io" style={reportLink}>
                  Vesta Software, Inc.
                </Link>
              </Row>
            </Section>
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

export default PMNotification

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
}

const heading = {
  fontSize: '32px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#484848',
}

const paragraph = {
  fontSize: '18px',
  lineHeight: '1.4',
  color: '#484848',
}

const review = {
  ...paragraph,
  padding: '24px',
  backgroundColor: '#f2f3f3',
  borderRadius: '4px',
}

const button = {
  backgroundColor: '#8434F4',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '18px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
}

const listing = {
  ...paragraph,
  color: '#8434F4',
  display: 'block',
}

const reportLink = {
  fontSize: '14px',
  color: '#9ca299',
  textDecoration: 'underline',
}

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
}

const info = {
  color: '#9ca299',
  fontSize: '14px',
  marginBottom: '10px',
}
