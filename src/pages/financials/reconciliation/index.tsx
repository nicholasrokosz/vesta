import { type NextPage } from 'next'
import React, { useCallback, useRef, useState } from 'react'
import {
  Space,
  Stack,
  Title,
  Text,
  Box,
  Flex,
  Button,
  Group,
  SegmentedControl,
} from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { api } from 'utils/api'
import { formatCurrency } from 'utils/formatCurrency'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'
import BankTransactionsTable from 'components/reconciliation/BankTransactionsTable/BankTransactionsTable'
import ReservationsTable from 'components/reconciliation/ReservationsTable/ReservationsTable'
import type { IPlaidTransaction } from 'types/expenses'
import type { IRevenueEvent, ReconciliationUrlParams } from 'types/revenue'
import DateString from 'types/dateString'
import { useReconciliationStatus } from 'hooks/useReconciliationStatus'
import { PlaidImportStatus } from '@prisma/client'
import { useUrlParams } from 'hooks/useUrlParams'

const Reconciliation: NextPage = () => {
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    refetch: transactionsRefetch,
  } = api.plaid.getBankTransactions.useQuery()
  const {
    data: reservationsData,
    isLoading: reservationsLoading,
    refetch: reservationsRefetch,
  } = api.revenue.getAllReservationRevenue.useQuery({
    fromDate: new Date().toDateString(),
  })
  const reconcileMutation = api.reconciliation.reconcile.useMutation()
  const dismissTransactionMutation = api.plaid.updateTransaction.useMutation()

  const { params, upsertParams, isActive } =
    useUrlParams<ReconciliationUrlParams>()

  const selectedTransactionsTab = isActive('transactionsTab')
    ? params.transactionsTab
    : PlaidImportStatus.PENDING
  const selectedReservationsTab = isActive('reservationsTab')
    ? params.reservationsTab
    : 'UNPAID'

  const transactionsTableRef: React.RefObject<{ resetSelections: () => void }> =
    useRef(null)
  const reservationsTableRef: React.RefObject<{ resetSelections: () => void }> =
    useRef(null)

  const transactions = transactionsData?.filter(
    (t) => t.status === selectedTransactionsTab
  )

  const reservations = reservationsData
    ?.map((e) => {
      return {
        ...e,
        toDate: DateString.fromString(e.toDate),
        fromDate: DateString.fromString(e.fromDate),
        bookedOn: e.bookedOn ? DateString.fromString(e.bookedOn) : undefined,
      }
    })
    .filter((r) => r.payoutStatus === selectedReservationsTab)

  const [selectedTransactions, setSelectedTransactions] = useState<
    IPlaidTransaction[]
  >([])
  const [selectedReservations, setSelectedReservations] = useState<
    IRevenueEvent[]
  >([])

  const reconciliationStatus = useReconciliationStatus({
    transactions: selectedTransactions,
    reservations: selectedReservations,
  })

  const updateSelectedTransactions = useCallback(
    (transactions: IPlaidTransaction[]) => {
      setSelectedTransactions(transactions)
    },
    []
  )
  const updateSelectedReservations = useCallback(
    (reservations: IRevenueEvent[]) => {
      setSelectedReservations(reservations)
    },
    []
  )

  const reconcileSelection = () => {
    reconcileMutation.mutate(
      {
        plaidTransactionIds: selectedTransactions.map((t) => t.id),
        reservationIds: selectedReservations.map((r) => r.id),
      },
      {
        onSuccess: () => {
          showNotification({
            title: 'Success!',
            message: 'The selection was reconciled',
            color: 'teal',
          })
          void transactionsRefetch()
          transactionsTableRef.current?.resetSelections()
          void reservationsRefetch()
          reservationsTableRef.current?.resetSelections()
        },
        onError: () => {
          showNotification({
            title: 'Error',
            message: 'Something went wrong during reconciliation',
            color: 'red',
          })
        },
      }
    )
  }

  const toggleTransactionDismissal = (
    transactionId: string,
    status: string
  ) => {
    dismissTransactionMutation.mutate(
      {
        id: transactionId,
        status,
      },
      {
        onSuccess: () => {
          void transactionsRefetch()
        },
        onError: () =>
          showNotification({
            title: 'Error',
            message: 'Something went wrong while dismissing the transaction',
            color: 'red',
          }),
      }
    )
  }

  return (
    <>
      <Breadcrumbs links={[{ title: 'Revenue reconciliation' }]} />
      <Space h="xl" />
      <VestaSpinnerOverlay
        visible={transactionsLoading || reservationsLoading}
      />

      <Stack>
        <Group w="100%" position="apart">
          <Box h="md">
            {reconciliationStatus.sumTransactions !== null && (
              <Text>
                Sum of selected transactions ={' '}
                {formatCurrency(reconciliationStatus.sumTransactions)}
              </Text>
            )}
          </Box>
          <Box h="md">
            {reconciliationStatus.sumTransactions !== null &&
              reconciliationStatus.sumReservations !== null && (
                <>
                  <Text>
                    Gap to reservation amount ={' '}
                    {formatCurrency(reconciliationStatus.gapToReconcile ?? 0)}
                  </Text>
                </>
              )}
          </Box>
          <Box h="md">
            {reconciliationStatus.sumReservations !== null && (
              <Text>
                Sum of selected reservations ={' '}
                {formatCurrency(reconciliationStatus.sumReservations)}
              </Text>
            )}
          </Box>
        </Group>

        <Button
          onClick={reconcileSelection}
          disabled={!reconciliationStatus.canReconcile}
          w={200}
        >
          Reconcile Selection
        </Button>
      </Stack>
      <Space h="md" />

      {!transactionsLoading && !reservationsLoading && (
        <Flex gap="lg">
          <Stack w="49%">
            <Title>Bank transactions</Title>
            <SegmentedControl
              value={selectedTransactionsTab}
              onChange={(val) =>
                upsertParams({
                  transactionsTab: val,
                })
              }
              data={[
                { label: 'Unreconciled', value: PlaidImportStatus.PENDING },
                { label: 'Reconciled', value: PlaidImportStatus.ACCEPTED },
                { label: 'Dismissed', value: PlaidImportStatus.DISMISSED },
              ]}
            />
            <BankTransactionsTable
              transactions={transactions as IPlaidTransaction[]}
              disableSelection={selectedReservations.length > 1}
              onTransactionsSelected={updateSelectedTransactions}
              onToggleTransactionDismissal={toggleTransactionDismissal}
              ref={transactionsTableRef}
            />
          </Stack>
          <Stack w="49%">
            <Title>Reservations</Title>
            <SegmentedControl
              value={selectedReservationsTab}
              onChange={(val) =>
                upsertParams({
                  reservationsTab: val,
                })
              }
              data={[
                { label: 'Unreconciled', value: 'UNPAID' },
                { label: 'Reconciled', value: 'FULL' },
              ]}
            />
            <ReservationsTable
              reservations={reservations ?? []}
              disableSelection={selectedTransactions.length > 1}
              onReservationsSelected={updateSelectedReservations}
              ref={reservationsTableRef}
            />
          </Stack>
        </Flex>
      )}
    </>
  )
}

export default Reconciliation
