import {
  Body,
  Column,
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
import { formatCurrency } from 'utils/formatCurrency'

interface Props {
  logoUrl: string | null
  listingImgUrl?: string
  listingName?: string
  propertyType: string
  orgName: string
  confirmationCode: string | null
  checkInDate: string
  checkInTime?: string
  checkOutDate: string
  checkOutTime?: string
  inlineAddress: string
  numGuests: number
  accommodationRevenue?: number
  fees?: { name: string; value: number }[]
  taxes?: { name: string; value: number }[]
  totalCost?: number
}

export function DirectBookingGuestConfirmation({
  logoUrl,
  listingImgUrl,
  listingName,
  propertyType,
  orgName,
  confirmationCode,
  checkInDate,
  checkInTime,
  checkOutDate,
  checkOutTime,
  inlineAddress,
  numGuests,
  accommodationRevenue: accommodationRevenue,
  fees,
  taxes,
  totalCost,
}: Props) {
  const previewText = `Confirming your upcoming stay at ${listingName ?? ''}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>

      <Body style={main}>
        <Section style={main}>
          <Container style={container}>
            {logoUrl && (
              <Section>
                <Img src={logoUrl} width="100" alt="Company logo" />
              </Section>
            )}
            <Section>
              {/*eslint-disable-next-line*/}
              <Text style={heading}>We're excited to have you!</Text>
            </Section>
            <Section>
              <Img src={listingImgUrl} width={500} alt="Company logo" />
            </Section>
            <Section>
              <Text style={underlinedHeading}>{listingName}</Text>
              <Text style={listing}>
                {propertyType} hosted by {orgName}
              </Text>
              <Text style={listing}>Confirmation code: {confirmationCode}</Text>
              <Text style={listing}># of guests: {numGuests}</Text>
            </Section>
            <Hr style={hr} />
            <Section style={{ paddingBottom: '20px' }}>
              <Row>
                <Column>
                  <Text style={smallerHeading}>Check-in</Text>
                  <Text style={heading}>{checkInDate}</Text>
                  <Text style={listing}>{checkInTime}</Text>
                </Column>
                <Column>
                  <Text style={smallerHeading}>Checkout</Text>
                  <Text style={heading}>{checkOutDate}</Text>
                  <Text style={listing}>{checkOutTime}</Text>
                </Column>
              </Row>
            </Section>
            <Hr style={hr} />
            <Section>
              <Text style={heading}>Address</Text>
              <Text style={listing}>{inlineAddress}</Text>
            </Section>
            <Hr style={hr} />
            <Section>
              <Row>
                <Text style={heading}>Cost</Text>
                <Column>
                  <Text style={listing}>Accommodation cost:</Text>
                  {fees &&
                    fees.map(({ name }) => (
                      <Text key={name} style={listing}>
                        {name}:
                      </Text>
                    ))}
                  {taxes && <Text style={listing}>Taxes:</Text>}
                  <Text style={listing}>Total:</Text>
                </Column>
                <Column style={dollarsColumn}>
                  <Text style={listing}>
                    {formatCurrency(accommodationRevenue as number)}
                  </Text>
                  {fees &&
                    fees.map(({ value }) => (
                      <Text key={value} style={listing}>
                        {formatCurrency(value)}
                      </Text>
                    ))}
                  {taxes && (
                    <Text style={listing}>
                      {formatCurrency(taxes.reduce((a, b) => a + b.value, 0))}
                    </Text>
                  )}
                  <Text style={listing}>
                    {formatCurrency(totalCost as number)}
                  </Text>
                </Column>
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

export default DirectBookingGuestConfirmation

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

const smallerHeading = {
  ...heading,
  fontSize: '24px',
  lineHeight: '1',
}

const underlinedHeading = {
  ...heading,
  textDecoration: 'underline',
}

const paragraph = {
  fontSize: '18px',
  lineHeight: '1.4',
  color: '#484848',
}

const listing = {
  ...paragraph,
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

const dollarsColumn = { textAlign: 'right' as const }
