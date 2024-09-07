import { DateTime } from 'luxon'
import type { Price } from 'server/services/rates/types'
import type DateString from 'types/dateString'

export const getYearBounds = (year: number): [Date, Date] => {
  const now = DateTime.now()
  const startOfYear =
    year === now.year ? now : DateTime.utc(year).startOf('year')
  const endOfYear = DateTime.utc(year).endOf('year')

  return [startOfYear.toJSDate(), endOfYear.toJSDate()]
}

export const monthEqualsFilterMonth = (date: DateString, filter: string) => {
  return date.getMonth() === new Date().getMonth() + 1 + parseInt(filter)
}

export const isDateStringLessThanOrEqual = (
  dateStr: string,
  date: Date
): boolean => {
  // Convert the Date object to a string in 'YYYY-MM-DD' format
  const formattedDate = DateTime.fromJSDate(date).toISODate()

  // Compare the strings
  return dateStr <= formattedDate
}

// Given an array of date strings and a selected date, finds the first date in the array that comes after the selected date and then returns the date before this found date.
export const getNextDate = (dateStrings: string[], startDate: Date) => {
  const dates = dateStrings.map((dateString) =>
    DateTime.fromISO(dateString, { zone: 'local' })
  )

  let start = 0
  let end = dates.length - 1

  while (start <= end) {
    const mid = Math.floor((start + end) / 2)

    if (isDateStringLessThanOrEqual(dateStrings[mid], startDate)) {
      start = mid + 1
    } else {
      end = mid - 1
    }
  }

  if (start < dates.length) {
    const resultDate = dates[start].toJSDate()
    resultDate.setDate(resultDate.getDate() - 1)
    return resultDate
  }

  // If there's no date in the array that's greater than startDate
  return null
}

export const getMonthStartAndEnd = (month: 'last' | 'current' | 'next') => {
  const today = new Date()
  const currentMonthIndex = today.getMonth()

  let monthIndex
  switch (month) {
    case 'last':
      monthIndex = currentMonthIndex - 1
      break
    case 'current':
      monthIndex = currentMonthIndex
      break
    case 'next':
      monthIndex = currentMonthIndex + 1
      break
  }

  const start = new Date(today.getFullYear(), monthIndex, 1)
  const end = new Date(today.getFullYear(), monthIndex + 1, 0)
  return [start, end]
}

export type CheckExcludeProps = {
  date: DateString
  selectedDate: DateString | null
  prices: Price[] | undefined
  blockedStartDates: string[] | undefined
  disableMinStay: boolean
}

export const checkIfExcluded = ({
  date,
  selectedDate,
  prices,
  blockedStartDates,
  disableMinStay,
}: CheckExcludeProps) => {
  // If a start date is selected, blocks checkout days that's don't meet min stay
  if (selectedDate && prices) {
    if (disableMinStay) return false
    const minStay = prices?.find((p) =>
      p.date.matchesDateString(selectedDate)
    )?.minStay
    if (!minStay) return false
    const diffInDays = date.compareToDateString(selectedDate)
    if (diffInDays <= 0) return false
    if (diffInDays < minStay) return true

    // If we don't have any blocked start dates, we don't need to check
  } else if (!blockedStartDates) {
    return false
  } else {
    return blockedStartDates.includes(date.toString())
  }

  return false
}
