import { useRouter } from 'next/router'
import type { UrlParams } from 'types/urlParams'
import type { MRT_ColumnFiltersState } from 'mantine-react-table'
import DateString from 'types/dateString'

export function useUrlParams<T>() {
  const router = useRouter()

  const params = router.query as unknown as UrlParams

  const dateParams = ['date', 'fromDate', 'bookedOn', 'toDate'] as T[]

  const upsertParams = (params: { [param: string]: string | string[] }) => {
    router.push({ query: { ...router.query, ...params } }).catch(console.error)
  }

  const removeParams = (params: T[]) => {
    const queryCopy = { ...router.query }
    for (const param of params) delete queryCopy[param as string]
    router.push({ query: queryCopy }).catch(console.error)
  }

  const isActive = (paramName: T) =>
    Object.keys(params).includes(paramName as string)

  const syncColumnFiltersParams = (
    paramNames: T[],
    columnFilters: MRT_ColumnFiltersState
  ) => {
    const toBeUpserted = []
    const toBeRemoved = []

    for (const param of paramNames) {
      const activeFilter = columnFilters.find((filter) => filter.id === param)

      if (!activeFilter) toBeRemoved.push(param)
      else {
        let filterValue = activeFilter.value

        if (dateParams.includes(param))
          filterValue = (filterValue as Date[]).map((date) =>
            DateString.fromDate(date).toString()
          )

        toBeUpserted.push({ [activeFilter.id]: filterValue })
      }
    }

    const newParams = toBeUpserted.reduce((a, b) => ({ ...a, ...b }), {})
    const queryCopy = { ...router.query }
    for (const param of toBeRemoved) delete queryCopy[param as string]
    router
      .push({ query: { ...queryCopy, ...(newParams as UrlParams) } })
      .catch(console.error)
  }

  return {
    params,
    upsertParams,
    removeParams,
    isActive,
    syncColumnFiltersParams,
  }
}
