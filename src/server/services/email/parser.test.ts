import {
  parseMailboxHash,
  parseReservationId,
  parsePropertyId,
  parseDates,
  parseReservationMessage,
  parseInquiryMessage,
} from './parser'

const reservationBody =
  "Brian Issleb has replied to your message\n\n\nProperty:\n        #3506302\nUnit:\n        Paradise in El Paso, Texas\nReservation ID:\n        292833219\nDates:\n        Dec 12 - Dec 15, 2023, 3 nights\nGuests:\n        2 adults, 0 children\nTraveler Name:\n        Brian Issleb\nTraveler Phone:\n        +1 (312) 493-8399\n\n-------\n\nHere's me, messaging with a reservation.\n\n\n-------We're here to help. Visit our Help Centre for useful info and FAQs.\n\n\u00a9 2023 Vrbo\n\nTerms & conditions\nhttps://www.vrbo.com/lp/b/terms-of-service?locale=en_US&pos=VRBO&siteid=9001001\n\nContact Us\nhttps://help.vrbo.com/contact\n\nPrivacy\nhttps://www.vrbo.com/lp/b/privacy-policy?locale=en_US&pos=VRBO&siteid=9001001"

const reservationReplyBody =
  "Vrbo: Brian Issleb has replied to your message\n\nAnd now I am replying to it.\n\n\n-------We're here to help. Visit our Help Centre for useful info and FAQs.\n\n\u00a9 2023 Vrbo\n\nTerms & conditions\nhttps://www.vrbo.com/lp/b/terms-of-service?locale=en_US&pos=VRBO&siteid=9001001\n\nContact Us\nhttps://help.vrbo.com/contact\n\nPrivacy\nhttps://www.vrbo.com/lp/b/privacy-policy?locale=en_US&pos=VRBO&siteid=9001001"

const inquiryBody =
  "Hello, Brian Issleb is interested in your property.\n\n\nProperty:\n        External ID 1235495468\n        #3506302\nUnit:\n        Paradise in El Paso, Texas\nDates:\n        Sep 27 - Sep 29, 2023, 2 nights\nGuests:\n        2 adults, 0 children\nTraveler Name:\n        Brian Issleb\nTraveler Phone:\n        Available when booked\nInquiry from:\n        Vrbo\n        https://www.vrbo.com\n\n\nFurther info\n\nI still really like this place!\n\nRespond to this Inquiry\n\nhttps://www.vrbo.com/rm/message/l-321.3506302.4079448/g-70ddd16a-9e5b-463e-83b0-8832dcc53940?mobileLink=https://o.hmwy.io/p7n8CQOJTBb&utm_campaign=VRBO_OWN_INQUIRY_PPB&utm_term=20230801&utm_source=SYS&utm_medium=email&utm_content=respond\n\n\n-------We're here to help. Visit our Help Centre for useful info and FAQs.\n\n\u00a9 2023 Vrbo\n\nTerms & conditions\nhttps://www.vrbo.com/lp/b/terms-of-service?locale=en_US&pos=VRBO&siteid=9001001\n\nContact Us\nhttps://help.vrbo.com/contact\n\nPrivacy\nhttps://www.vrbo.com/lp/b/privacy-policy?locale=en_US&pos=VRBO&siteid=9001001"

const inquiryReplyBody =
  "Vrbo: Brian Issleb has replied to your message\n\nThis is cool, thanks.\n\n\n-------We're here to help. Visit our Help Centre for useful info and FAQs.\n\n\u00a9 2023 Vrbo\n\nTerms & conditions\nhttps://www.vrbo.com/lp/b/terms-of-service?locale=en_US&pos=VRBO&siteid=9001001\n\nContact Us\nhttps://help.vrbo.com/contact\n\nPrivacy\nhttps://www.vrbo.com/lp/b/privacy-policy?locale=en_US&pos=VRBO&siteid=9001001"

describe('parseMailboxHash', () => {
  it('should get an orgId', () => {
    const result = parseMailboxHash('1234')

    expect(result.organizationId).toEqual('1234')
  })

  it('should get an orgId when a messageThreadId is present', () => {
    const result = parseMailboxHash('1234-4567')

    expect(result.organizationId).toEqual('1234')
  })

  it('should get a messageThreadId when present', () => {
    const result = parseMailboxHash('1234-4567')

    expect(result.messageThreadId).toEqual('4567')
  })
})

describe('parsePropertyId', () => {
  it('should get the productId', () => {
    const result = parsePropertyId(inquiryBody)

    expect(result).toEqual('1235495468')
  })
})

describe('parseReservationId', () => {
  it('should get the reservationId', () => {
    const result = parseReservationId(reservationBody)

    expect(result).toEqual('292833219')
  })

  it('should return null when no reservationId', () => {
    const result = parseReservationId(inquiryBody)

    expect(result).toBeNull()
  })
})

describe('parseDates', () => {
  it('should get the dates for a reservation', () => {
    const result = parseDates(reservationBody) as [Date, Date]

    expect(result[0].toISOString().slice(0, 10)).toEqual('2023-12-12')
    expect(result[1].toISOString().slice(0, 10)).toEqual('2023-12-15')
  })

  it('should get the dates for an inquiry', () => {
    const result = parseDates(inquiryBody) as [Date, Date]

    expect(result[0].toISOString().slice(0, 10)).toEqual('2023-09-27')
    expect(result[1].toISOString().slice(0, 10)).toEqual('2023-09-29')
  })
})

describe('parseReservationMessage', () => {
  it('should get the message for a reservation', () => {
    const result = parseReservationMessage(reservationBody)

    expect(result).toBe("Here's me, messaging with a reservation.")
  })

  it('should get the message for a reservation reply', () => {
    const result = parseReservationMessage(reservationReplyBody)

    expect(result).toBe('And now I am replying to it.')
  })
})

describe('parseInquiryMessage', () => {
  it('should get the message for an inquiry', () => {
    const result = parseInquiryMessage(inquiryBody)

    expect(result).toBe('I still really like this place!')
  })

  it('should get the message for an inquiry reply', () => {
    const result = parseInquiryMessage(inquiryReplyBody)

    expect(result).toBe('This is cool, thanks.')
  })
})
