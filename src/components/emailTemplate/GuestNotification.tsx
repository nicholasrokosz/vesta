import { DateTime } from 'luxon'

import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface Props {
  guestName: string
  listingPmName: string
  ListingPmOrgName: string
  messageText: string
  messageTime: Date
  headerText: string
}

export function GuestNotification({
  guestName,
  listingPmName,
  ListingPmOrgName,
  messageText,
  messageTime,
  headerText,
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
                <Text style={heading}>{headerText}</Text>
                <Text
                  style={listing}
                >{`From ${listingPmName} @ ${ListingPmOrgName}`}</Text>
                <Text style={review}>{messageText}</Text>
                <Text style={info}>
                  {DateTime.fromJSDate(messageTime).toFormat('LLL L, t')}
                </Text>
                <Text>Reply to this email to respond</Text>
              </Row>
            </Section>

            <Hr style={hr} />

            <Section>
              <Row>Sent via Vesta Software, Inc.</Row>
            </Section>
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

export default GuestNotification

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

const listing = {
  ...paragraph,
  color: '#8434F4',
  display: 'block',
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
