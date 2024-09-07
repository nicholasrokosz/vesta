import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useMemo,
} from 'react'
import {
  MantineReactTable,
  MRT_ShowHideColumnsButton,
  MRT_ToggleGlobalFilterButton,
  useMantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table'
import type {
  MRT_SortingState,
  MRT_ColumnFiltersState,
  MRT_Row,
} from 'mantine-react-table'
import { useUrlParams } from 'hooks/useUrlParams'
import type { SortDir } from 'types/urlParams'
import type { IRevenueEvent, ReservationUrlParams } from 'types/revenue'
import DateString from 'types/dateString'
import DateFilterRangePicker from 'components/calendar/DateFilterRangePicker/DateFilterRangePicker'
import { ActionIcon, Flex, Tooltip } from '@mantine/core'
import { IconFilterOff } from '@tabler/icons-react'

interface Props {
  reservations: IRevenueEvent[]
  disableSelection?: boolean
  onReservationsSelected: (reservations: IRevenueEvent[]) => void
}

const ReservationsTable = (
  { reservations, disableSelection, onReservationsSelected }: Props,
  ref: React.ForwardedRef<unknown>
) => {
  const {
    params,
    upsertParams,
    removeParams,
    isActive,
    syncColumnFiltersParams,
  } = useUrlParams<ReservationUrlParams>()

  const [reservationsData, setReservationsData] = useState(reservations)

  const objectsEqual = (o1: IRevenueEvent[], o2: IRevenueEvent[]) => {
    if (o1.length !== o2.length) return false
    for (let i = 0; i < o1.length; i++) {
      if (o1[i].id !== o2[i].id) return false
    }
    return true
  }

  useEffect(() => {
    if (!objectsEqual(reservations, reservationsData))
      setReservationsData(reservations)
  }, [reservations])

  const [selectedReservationIds, setSelectedReservationIds] = useState<
    string[]
  >([])

  const initialSort = isActive('reservationsSort')
    ? [
        {
          id: params.reservationsSort,
          desc: params.reservationsDir === 'desc',
        },
      ]
    : []
  const [sorting, setSorting] = useState<MRT_SortingState>(initialSort)

  const initialFilters: { id: string; value: string | string[] | Date[] }[] =
    isActive('channel')
      ? [
          {
            id: 'channel',
            value: Array.isArray(params.channel)
              ? params.channel
              : [params.channel],
          },
        ]
      : []
  if (isActive('status')) {
    initialFilters.push({
      id: 'status',
      value: Array.isArray(params.status) ? params.status : [params.status],
    })
  }
  if (isActive('fromDate')) {
    initialFilters.push({
      id: 'fromDate',
      value: (params.fromDate as unknown as string[]).map((str) =>
        DateString.fromString(str).toDate()
      ),
    })
  }
  if (isActive('bookedOn')) {
    initialFilters.push({
      id: 'bookedOn',
      value: (params.bookedOn as unknown as string[]).map((str) =>
        DateString.fromString(str).toDate()
      ),
    })
  }
  if (isActive('toDate')) {
    initialFilters.push({
      id: 'toDate',
      value: (params.toDate as unknown as string[]).map((str) =>
        DateString.fromString(str).toDate()
      ),
    })
  }

  const [columnFilters, setColumnFilters] =
    useState<MRT_ColumnFiltersState>(initialFilters)

  useEffect(() => {
    syncColumnFiltersParams(
      ['channel', 'status', 'fromDate', 'bookedOn', 'toDate'],
      columnFilters
    )
  }, [columnFilters])

  useEffect(() => {
    const sortedColumn = table
      .getAllColumns()
      .find((column) => column.getIsSorted() !== false)
    const sortDir = sortedColumn?.getIsSorted() as SortDir

    if (sortedColumn)
      upsertParams({
        reservationsSort: sortedColumn.id,
        reservationsDir: sortDir,
      })
    else removeParams(['reservationsSort', 'reservationsDir'])
  }, [sorting])

  const getCheckboxProps = ({ row }: { row: MRT_Row<IRevenueEvent> }) => ({
    disabled:
      selectedReservationIds.length > 0
        ? selectedReservationIds.includes(row.original.id)
          ? false
          : disableSelection
        : false,
  })

  const columns = useMemo<MRT_ColumnDef<IRevenueEvent>[]>(
    () => [
      {
        accessorFn: (row) => row.revenue.payoutAmount,
        header: 'Payout',
        id: 'payout',
        filterVariant: 'range-slider',
        Cell: ({ cell }) =>
          cell.getValue<number>().toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          }),
        mantineFilterRangeSliderProps: {
          label: (value) =>
            value.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            }),
        },
        size: 104,
      },
      {
        accessorKey: 'channel',
        header: 'Channel',
        filterVariant: 'multi-select',
        size: 112,
      },
      {
        accessorFn: (row) => row.fromDate?.toDate(),
        Cell: ({ cell }) =>
          DateString.fromDate(cell.getValue<Date>()).toFormattedString(),
        id: 'fromDate',
        header: 'Check-in',
        sortingFn: 'datetime',
        size: 118,
        filterFn: (row, id, filterValue) => {
          // eslint-disable-next-line
          const cellValue = row.getValue(id) as Date
          const [filterStartDate, filterEndDate] = filterValue as Date[]
          if (!filterStartDate || !filterEndDate) return true
          return filterStartDate <= cellValue && filterEndDate >= cellValue
        },
        Filter: ({ table }) => (
          <DateFilterRangePicker table={table} columnName="fromDate" />
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        filterVariant: 'multi-select',
        size: 112,
      },
      {
        accessorFn: (row) => row.bookedOn?.toDate(),
        Cell: ({ cell }) => {
          const cellValue = cell.getValue<Date>()
          return cellValue
            ? DateString.fromDate(cellValue).toFormattedString()
            : ''
        },
        id: 'bookedOn',
        header: 'Booked on',
        sortingFn: 'datetime',
        size: 128,
        filterFn: (row, id, filterValue) => {
          // eslint-disable-next-line
          const cellValue = row.getValue(id) as Date
          const [filterStartDate, filterEndDate] = filterValue as Date[]
          if (!filterStartDate || !filterEndDate) return true
          return filterStartDate <= cellValue && filterEndDate >= cellValue
        },
        Filter: ({ table }) => (
          <DateFilterRangePicker table={table} columnName="bookedOn" />
        ),
      },
      {
        accessorFn: (row) => row.toDate?.toDate(),
        Cell: ({ cell }) =>
          DateString.fromDate(cell.getValue<Date>()).toFormattedString(),
        id: 'toDate',
        header: 'Checkout',
        sortingFn: 'datetime',
        size: 122,
        filterFn: (row, id, filterValue) => {
          // eslint-disable-next-line
          const cellValue = row.getValue(id) as Date
          const [filterStartDate, filterEndDate] = filterValue as Date[]
          if (!filterStartDate || !filterEndDate) return true
          return filterStartDate <= cellValue && filterEndDate >= cellValue
        },
        Filter: ({ table }) => (
          <DateFilterRangePicker table={table} columnName="toDate" />
        ),
      },
      {
        accessorKey: 'confirmationCode',
        header: 'Confirmation code',
        size: 200,
      },
    ],
    []
  )

  const table = useMantineReactTable({
    columns,
    data: reservationsData,
    mantineTableProps: {
      sx: {
        tableLayout: 'fixed',
      },
    },
    enableRowSelection: true,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableFacetedValues: true,
    enableStickyHeader: true,
    enableMultiSort: false,
    mantineTableContainerProps: { mah: 'calc(100vh - 300px)' },
    mantineSelectCheckboxProps: getCheckboxProps,
    state: { sorting, columnFilters, density: 'xs' },
    paginationDisplayMode: 'pages',
    mantinePaginationProps: {
      withEdges: false,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    columnFilterDisplayMode: 'popover',
    renderToolbarInternalActions: ({ table }) => (
      <Flex gap="xxxs" align="center">
        <Tooltip label="Clear filters">
          <ActionIcon
            disabled={columnFilters.length === 0}
            onClick={() => {
              setColumnFilters([])
            }}
          >
            <IconFilterOff />
          </ActionIcon>
        </Tooltip>
        <MRT_ToggleGlobalFilterButton table={table} />
        <MRT_ShowHideColumnsButton table={table} />
      </Flex>
    ),
  })

  useImperativeHandle(
    ref,
    () => {
      return {
        resetSelections() {
          table.resetRowSelection()
        },
      }
    },
    []
  )

  const selectedRows = table.getSelectedRowModel().rows
  useEffect(() => {
    if (selectedRows.length > 0) {
      setSelectedReservationIds(selectedRows.map((row) => row.original.id))
      onReservationsSelected(selectedRows.map((row) => row.original))
    } else {
      onReservationsSelected([])
      setSelectedReservationIds([])
    }
  }, [selectedRows])

  return <MantineReactTable table={table} />
}

export default forwardRef(ReservationsTable)
