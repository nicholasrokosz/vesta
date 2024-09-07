import { useState } from 'react'
import { ActionIcon, Box, Flex, Tooltip } from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import type { DatesRangeValue } from '@mantine/dates'
import type { MRT_TableInstance } from 'mantine-react-table'
// import type { IPlaidTransaction } from 'types/expenses'
import { IconX } from '@tabler/icons-react'

interface Props {
  // eslint-disable-next-line
  table: MRT_TableInstance<any>
  columnName: string
}

const DateFilterRangePicker = ({ table, columnName }: Props) => {
  const columnFilters = table.getState().columnFilters
  const dateFilter = columnFilters.find((filter) => filter.id === columnName)
  const [filterDates, setFilterDates] = useState<[Date | null, Date | null]>(
    dateFilter ? (dateFilter.value as [Date, Date]) : [null, null]
  )

  const handleChange = (val: DatesRangeValue) => {
    setFilterDates(val)
    if (val.includes(null)) return
    const newFilters = columnFilters.filter(
      (filter) => filter.id !== columnName
    )
    const newVal = val.map((i) => i ?? undefined)
    table.setColumnFilters(() => [
      ...newFilters,
      { id: columnName, value: newVal },
    ])
  }

  return (
    <Flex w="100%" justify="end">
      <DatePicker
        size="md"
        my="md"
        type="range"
        value={filterDates}
        onChange={(val) => handleChange(val)}
        defaultDate={filterDates[0] ?? undefined}
      />
      {!filterDates.includes(null) ? (
        <Tooltip label="Clear dates filter">
          <ActionIcon
            style={{ justifySelf: 'end' }}
            variant="subtle"
            onClick={() => {
              setFilterDates([null, null])
              const filtersWithOutDate = columnFilters.filter(
                (filter) => filter.id !== columnName
              )
              table.setColumnFilters(() => filtersWithOutDate)
            }}
          >
            <IconX size={18} />
          </ActionIcon>
        </Tooltip>
      ) : (
        <Box w="28px"></Box>
      )}
    </Flex>
  )
}

export default DateFilterRangePicker
