import { DateTime } from 'luxon'

export const formatTimeWithZone = function (date: Date, timeZone: string) {
  const dt = DateTime.fromJSDate(date).setZone(timeZone)
  return `${dt.toLocaleString(DateTime.TIME_SIMPLE)} ${dt.toFormat('ZZZZ')}`
}

export interface IDateRange {
  fromDate: Date
  toDate: Date
}

export const formatDateRange = function (range: IDateRange) {
  return `${DateTime.fromJSDate(range.fromDate).toFormat(
    'MMM d'
  )} - ${DateTime.fromJSDate(range.toDate).toFormat('MMM d')}`
}

export const getDayNames = (days: string | null) => {
  if (!days) return ''

  const dayInts = days.split(',').map((day) => Number(day))
  const dayNames = dayInts.map((day) => {
    const dt = DateTime.fromObject({ weekday: day })
    return dt.toFormat('cccc')
  })
  return dayNames.join(', ')
}

export const getLongDateTime = (date: Date) => {
  const formattedDate = `${date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })} at ${date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}`

  return formattedDate
}
