export const parseMailboxHash = (mailboxHash: string) => {
  const segments = mailboxHash.split('-')

  const organizationId = segments[0]
  const messageThreadId = segments.length > 0 ? segments[1] : null

  return {
    organizationId,
    messageThreadId,
  }
}

export const parseReservationId = (body: string) => {
  const match = body.match(/Reservation ID:\s*([0-9]+)/)
  return match ? match[1] : null
}

export const parsePropertyId = (body: string) => {
  const match = body.match(/External ID ([0-9]+)\n/)
  return match ? match[1] : null
}

export const parseDates = (body: string) => {
  const match = body.match(
    /Dates:\s*([A-Za-z]+ [0-9]+ - [A-Za-z]+ [0-9]+), ([0-9]+), [0-9]+ night/
  )
  if (match) {
    const dates = match[1].split(' - ')
    const year = match[2]
    const startDate = new Date(`${dates[0]}, ${year}`)
    const endDate = new Date(`${dates[1]}, ${year}`)
    return [startDate, endDate]
  }
  return null
}

export const parseReservationMessage = (body: string) => {
  const match = body.match(/-------\n\n([\s\S]*?)\n\n-------/)

  if (match) return match[1].trim()

  const match2 = body.match(
    /replied to your message\n\n([\s\S]*?)\n\n\n-------/
  )

  return match2 ? match2[1].trim() : null
}

export const parseInquiryMessage = (body: string) => {
  const match = body.match(
    /Further info\n\n([\s\S]*?)\n\nRespond to this Inquiry/
  )

  if (match) return match[1].trim()

  const match2 = body.match(
    /replied to your message\n\n([\s\S]*?)\n\n\n-------/
  )

  return match2 ? match2[1].trim() : null
}
