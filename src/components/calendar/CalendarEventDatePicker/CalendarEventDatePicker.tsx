import { DatePickerInput } from '@mantine/dates'
import { DateTime } from 'luxon'
import { useState, useEffect } from 'react'
import type { Price } from 'server/services/rates/types'
import DateString from 'types/dateString'
import { checkIfExcluded, getNextDate } from 'utils/dates'

interface Props {
  blockedStartDates: string[] | undefined
  blockedEndDates: string[] | undefined
  prices: Price[] | undefined
  disabled: boolean
  startDate: DateString | null
  disableMinDate: boolean
  disableMinStay: boolean
  onSetDates: (dates: [DateString, DateString]) => void
}

const CalendarEventDatePicker = ({
  blockedStartDates,
  blockedEndDates,
  prices,
  disabled,
  startDate,
  disableMinDate,
  disableMinStay,
  onSetDates,
}: Props) => {
  const threeYearsMax = DateTime.now().plus({ years: 3 }).toJSDate()

  const [minDate, setMinDate] = useState<Date | null>(
    disableMinDate ? null : new Date()
  )
  const [maxDate, setMaxDate] = useState<Date>(threeYearsMax)
  const [value, setValue] = useState<[Date | null, Date | null]>([
    startDate ? startDate.toDate() : null,
    null,
  ])

  const checkExclude = (date: Date | undefined) => {
    if (!date) return false
    return checkIfExcluded({
      date: DateString.fromDate(date),
      selectedDate: value[0] ? DateString.fromDate(value[0]) : null,
      prices,
      blockedStartDates,
      disableMinStay,
    })
  }

  useEffect(() => {
    if (value[0] && !value[1]) {
      const validDate = value[0]
      setMinDate(validDate)
      const maxDate = getNextDate(blockedEndDates ?? [], validDate)
      if (maxDate) {
        setMaxDate(maxDate)
      } else {
        setMaxDate(threeYearsMax)
      }
    } else if (!value[0]) {
      setMinDate(disableMinDate ? null : new Date())
      setMaxDate(threeYearsMax)
    }

    if (value[0] && value[1]) {
      onSetDates([DateString.fromDate(value[0]), DateString.fromDate(value[1])])
    }
  }, [value, blockedEndDates])

  // This will effectively clear set dates when you change listing
  useEffect(() => {
    if (value[1]) setValue([null, null])
  }, [blockedStartDates])

  return (
    <DatePickerInput
      type="range"
      allowSingleDateInRange={false}
      placeholder="Select dates"
      minDate={minDate ?? undefined}
      maxDate={maxDate}
      disabled={disabled}
      value={value}
      onChange={setValue}
      excludeDate={(date) => checkExclude(date)}
      styles={{
        day: {
          '&[data-weekend], &[data-outside]': {
            color: 'black',
          },
        },
      }}
    />
  )
}

export default CalendarEventDatePicker
