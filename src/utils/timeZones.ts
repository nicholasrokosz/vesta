import { Info } from 'luxon'
import { zones } from 'tzdata'

export const timeZones = (): string[] => {
  return [
    ...new Set<string>(
      Object.keys(zones).filter(
        (tz) => tz.includes('/') && Info.isValidIANAZone(tz)
      )
    ),
  ].sort()
}
