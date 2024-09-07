export function getBlockedDates(
  reservations: {
    startDate: Date
    endDate: Date
  }[]
): string[] {
  const blockedDates: string[] = []
  let lastReservationEndDate = new Date()

  const sortedDates = reservations.sort((a, b) => {
    return a.startDate.getTime() - b.startDate.getTime()
  })

  for (const { startDate, endDate } of sortedDates) {
    const currentDate = new Date(startDate)

    while (currentDate < endDate) {
      if (currentDate.toDateString() == startDate.toDateString()) {
        if (
          currentDate.toDateString() == lastReservationEndDate.toDateString()
        ) {
          blockedDates.push(currentDate.toISOString().slice(0, 10))
        }
      } else {
        blockedDates.push(currentDate.toISOString().slice(0, 10))
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    lastReservationEndDate = new Date(endDate)
  }
  return blockedDates
}

export function dateIsBlocked(blockedDates: string[], date: Date): boolean {
  return blockedDates.includes(date.toISOString().slice(0, 10))
}

export function validateDateRange(
  blockedDates: string[],
  fromDate: Date,
  toDate: Date
): boolean {
  for (let day = fromDate; day <= toDate; day.setDate(day.getDate() + 1)) {
    if (dateIsBlocked(blockedDates, day)) return false
  }
  return true
}
