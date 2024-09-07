import { DateTime } from 'luxon'

class DateString {
  static FORMAT = /^(\d{4})-(\d{1,2})-(\d{1,2})$/

  private year: number
  private month: number
  private day: number
  private dateString: string

  constructor(dateString: string) {
    const match = dateString.match(DateString.FORMAT)
    if (!match) {
      throw new Error(`Invalid date string format: ${dateString}`)
    }
    this.year = Number(match[1])
    this.month = Number(match[2])
    this.day = Number(match[3])
    this.dateString = `${this.year}-${this.month
      .toString()
      .padStart(2, '0')}-${this.day.toString().padStart(2, '0')}`
  }

  public toString(): string {
    return this.dateString
  }

  public toDate() {
    return new Date(this.year, this.month - 1, this.day)
  }

  public toDateTime() {
    return DateTime.fromISO(this.toString())
  }

  public getYear(): number {
    return this.year
  }

  public getMonth(): number {
    return this.month
  }

  public getDay(): number {
    return this.day
  }

  public static fromString(dateString: string): DateString {
    return new DateString(dateString)
  }

  public static fromDate(date: Date): DateString {
    const timeString = date.toISOString().split('T')[1]
    if (timeString === '00:00:00.000Z') {
      return new DateString(date.toISOString().split('T')[0])
    } else {
      return new DateString(
        `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      )
    }
  }

  public matchesDate(jsDate: Date | undefined) {
    if (!jsDate) return false

    const yearMatches = this.year === jsDate.getFullYear()
    const monthMatches = this.month === jsDate.getMonth() + 1
    const dayMatches = this.day === jsDate.getDate()

    return yearMatches && monthMatches && dayMatches
  }

  public matchesDateString(dateString: DateString) {
    return this.toString() === dateString.toString()
  }

  public compareToDate(jsDate: Date) {
    return this.compareToDateString(DateString.fromDate(jsDate))
  }

  public compareToDateString(dateString: DateString) {
    const diffInMilliseconds =
      this.toDate().valueOf() - dateString.toDate().valueOf()

    const diffInDays = diffInMilliseconds / (24 * 60 * 60 * 1000)
    return diffInDays
  }

  public toFormattedString() {
    return this.toDateTime().toFormat('MM/dd/yyyy')
  }
}

export default DateString
