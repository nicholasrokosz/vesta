import {
  forwardRef,
  useEffect,
  useState,
  useImperativeHandle,
  useMemo,
} from 'react'
import { ActionIcon, Flex, Tooltip } from '@mantine/core'
import { PlaidImportStatus } from '@prisma/client'
import {
  IconArrowBackUp,
  IconCircleX,
  IconFilterOff,
} from '@tabler/icons-react'
import {
  MantineReactTable,
  MRT_ShowHideColumnsButton,
  MRT_ToggleGlobalFilterButton,
  useMantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table'
import type {
  MRT_Row,
  MRT_ColumnFiltersState,
  MRT_SortingState,
} from 'mantine-react-table'

import DateString from 'types/dateString'
import type { IPlaidTransaction } from 'types/expenses'
import { useUrlParams } from 'hooks/useUrlParams'
import type { SortDir } from 'types/urlParams'
import type { TransactionUrlParams } from 'types/revenue'
import DateFilterRangePicker from 'components/calendar/DateFilterRangePicker/DateFilterRangePicker'

interface Props {
  transactions: IPlaidTransaction[]
  disableSelection?: boolean
  onTransactionsSelected: (transaction: IPlaidTransaction[]) => void
  onToggleTransactionDismissal: (transactionId: string, status: string) => void
}

const TransactionImportTable = (
  {
    transactions,
    disableSelection,
    onTransactionsSelected,
    onToggleTransactionDismissal,
  }: Props,
  ref: React.ForwardedRef<unknown>
) => {
  const {
    params,
    upsertParams,
    removeParams,
    isActive,
    syncColumnFiltersParams,
  } = useUrlParams<TransactionUrlParams>()
  const [transactionsData, setTransactionsData] = useState(transactions)

  const objectsEqual = (o1: IPlaidTransaction[], o2: IPlaidTransaction[]) => {
    if (o1.length !== o2.length) return false
    for (let i = 0; i < o1.length; i++) {
      if (o1[i].id !== o2[i].id) return false
    }
    return true
  }

  useEffect(() => {
    if (!objectsEqual(transactions, transactionsData))
      setTransactionsData(transactions)
  }, [transactions])

  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    string[]
  >([])

  const initialSort = isActive('transactionsSort')
    ? [
        {
          id: params.transactionsSort,
          desc: params.transactionsDir === 'desc',
        },
      ]
    : []
  const [sorting, setSorting] = useState<MRT_SortingState>(initialSort)

  const initialFilters: { id: string; value: string | string[] | Date[] }[] =
    isActive('vendor')
      ? [
          {
            id: 'vendor',
            value: params.vendor,
          },
        ]
      : []
  if (isActive('date')) {
    initialFilters.push({
      id: 'date',
      value: (params.date as unknown as string[]).map((str) =>
        DateString.fromString(str).toDate()
      ),
    })
  }
  const [columnFilters, setColumnFilters] =
    useState<MRT_ColumnFiltersState>(initialFilters)

  useEffect(() => {
    const sortedColumn = table
      .getAllColumns()
      .find((column) => column.getIsSorted() !== false)

    const sortDir = sortedColumn?.getIsSorted() as SortDir

    if (sortedColumn)
      upsertParams({
        transactionsSort: sortedColumn.id,
        transactionsDir: sortDir,
      })
    else removeParams(['transactionsSort', 'transactionsDir'])
  }, [sorting])

  useEffect(() => {
    syncColumnFiltersParams(['vendor', 'date'], columnFilters)
  }, [columnFilters])

  const renderRowAction = ({ row }: { row: MRT_Row<IPlaidTransaction> }) => {
    if (row.original.status === PlaidImportStatus.ACCEPTED) {
      return <></>
    }
    return row.original.status === PlaidImportStatus.PENDING ? (
      <Tooltip label="Dismiss this transaction">
        <ActionIcon
          size={20}
          onClick={() =>
            onToggleTransactionDismissal(
              row.original.id,
              PlaidImportStatus.DISMISSED
            )
          }
          aria-label="Dismiss"
        >
          <IconCircleX color="red" />
        </ActionIcon>
      </Tooltip>
    ) : (
      <Tooltip label="Undo Dismiss transaction">
        <ActionIcon
          size={20}
          onClick={() =>
            onToggleTransactionDismissal(
              row.original.id,
              PlaidImportStatus.PENDING
            )
          }
          aria-label="Undo Dismiss"
        >
          <IconArrowBackUp color="green" />
        </ActionIcon>
      </Tooltip>
    )
  }

  const getCheckboxProps = ({ row }: { row: MRT_Row<IPlaidTransaction> }) => ({
    disabled:
      selectedTransactionIds.length > 0
        ? selectedTransactionIds.includes(row.original.id)
          ? false
          : disableSelection
        : false,
  })

  const columns = useMemo<MRT_ColumnDef<IPlaidTransaction>[]>(
    () => [
      {
        accessorKey: 'amount',
        header: 'Amount',
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
        size: 112,
      },
      {
        accessorKey: 'vendor',
        header: 'Vendor',
        size: 200,
        maxSize: 300,
      },
      {
        accessorFn: (row) => DateString.fromDate(row.date).toDate(),
        Cell: ({ cell }) =>
          DateString.fromDate(cell.getValue<Date>()).toFormattedString(),
        id: 'date',
        header: 'Date',
        sortingFn: 'datetime',
        size: 112,
        filterFn: (row, id, filterValue) => {
          // eslint-disable-next-line
          const cellValue = row.getValue(id) as Date
          const [filterStartDate, filterEndDate] = filterValue as Date[]
          if (!filterStartDate || !filterEndDate) return true
          return filterStartDate <= cellValue && filterEndDate >= cellValue
        },
        Filter: ({ table }) => (
          <DateFilterRangePicker table={table} columnName="date" />
        ),
      },
    ],
    []
  )

  const table = useMantineReactTable({
    columns,
    data: transactionsData,
    mantineTableProps: {
      sx: {
        tableLayout: 'fixed',
      },
    },
    enableRowActions: true,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: 'Action',
        size: 60,
      },
    },
    positionActionsColumn: 'last',
    enableRowSelection: true,
    enableFacetedValues: true,
    enableStickyHeader: true,
    enableMultiSort: false,
    mantineTableContainerProps: { mah: 'calc(100vh - 300px)' },
    mantineSelectCheckboxProps: getCheckboxProps,
    paginationDisplayMode: 'pages',
    mantinePaginationProps: {
      withEdges: false,
    },
    state: { sorting, columnFilters, density: 'xs' },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    renderRowActions: renderRowAction,
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
      setSelectedTransactionIds(selectedRows.map((row) => row.original.id))
      onTransactionsSelected(selectedRows.map((row) => row.original))
    } else {
      setSelectedTransactionIds([])
      onTransactionsSelected([])
    }
  }, [selectedRows])

  return <MantineReactTable table={table} />
}

export default forwardRef(TransactionImportTable)
