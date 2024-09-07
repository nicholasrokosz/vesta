class Time {
  private hours: number
  private minutes = 0

  constructor(hours: number, minutes: number) {
    if (hours < 0 || hours > 23) {
      throw new Error(`Invalid hours value: ${hours}`)
    }

    if (minutes < 0 || minutes > 59) {
      throw new Error(`Invalid minutes value: ${minutes}`)
    }
    this.hours = hours
    this.minutes = minutes
  }

  public getHours(): number {
    return this.hours
  }

  public getMinutes(): number {
    return this.minutes
  }

  public toString(): string {
    const hoursStr = this.hours < 10 ? `0${this.hours}` : `${this.hours}`
    const minutesStr =
      this.minutes < 10 ? `0${this.minutes}` : `${this.minutes}`
    return `${hoursStr}:${minutesStr}`
  }

  public static fromString(timeString: string): Time {
    const match = timeString.match(/^(\d{1,2})(?::?)(\d{2})(am|pm)?$/i)
    if (!match) {
      throw new Error(`Invalid time string format: ${timeString}`)
    }

    let hours = Number(match[1])
    const minutes = Number(match[2])
    const amPm = match[3]

    if (amPm && amPm.toLowerCase() === 'pm') {
      if (hours !== 12) {
        hours += 12
      }
    } else if (amPm && amPm.toLowerCase() === 'am') {
      if (hours === 12) {
        hours = 0
      }
    }

    return new Time(hours, minutes)
  }
}

export default Time
