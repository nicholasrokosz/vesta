import { ActionIcon, Group, NumberInput, TextInput } from '@mantine/core'
import { IconCurrencyDollar, IconX } from '@tabler/icons-react'
import SelectListing from 'components/listings/SelectListing/Single'
import { useEffect, useState } from 'react'
import type { ListingExpenseCreate } from 'types/expenses'

interface Props {
  expense: ListingExpenseCreate
  setExpense: (expense: ListingExpenseCreate) => void
  error: boolean | 'duplicatelisting'
  onDelete: (id: string) => void
}

const ListingExpense = ({ expense, setExpense, error, onDelete }: Props) => {
  const [listingId, setListingId] = useState<string>(expense.listingId)
  const [amount, setAmount] = useState<number>(expense.amount)
  const [amountPaid, setAmountPaid] = useState<number>(expense.amountPaid)
  const [confirmationCode, setConfirmationCode] = useState<string>(
    expense.confirmationCode || ''
  )

  useEffect(() => {
    setExpense({
      id: expense.id,
      expenseId: expense.expenseId,
      listingId,
      amount,
      amountPaid,
      confirmationCode,
    })
  }, [listingId, amount, amountPaid, confirmationCode])

  const handleDuplicateListingError = () => {
    if (error === 'duplicatelisting') return 'Listing must be unique'
    if (error && !listingId) return 'Required'
  }

  return (
    <Group align="flex-start" spacing="xs">
      <SelectListing
        displayLabel
        error={handleDuplicateListingError()}
        excludeIds={[]}
        selectedId={listingId}
        onSelect={(id) => setListingId(id)}
      />
      <NumberInput
        w={100}
        label="Owner billed"
        icon={<IconCurrencyDollar size={16} />}
        withAsterisk
        iconWidth={25}
        hideControls
        precision={2}
        value={amount}
        error={error && amount === 0 ? 'Required' : undefined}
        onChange={(val) => setAmount((val as number) || 0)}
      />
      <NumberInput
        w={100}
        label="Owner paid"
        icon={<IconCurrencyDollar size={16} />}
        iconWidth={25}
        hideControls
        precision={2}
        value={amountPaid}
        onChange={(val) => setAmountPaid((val as number) || 0)}
      />
      <TextInput
        label="Confirmation code"
        placeholder="Enter confirmation code"
        value={confirmationCode}
        onChange={(e) => setConfirmationCode(e.target.value)}
      />
      <ActionIcon
        mt="lg"
        variant="subtle"
        onClick={() => onDelete(expense.id || '')}
      >
        <IconX size={14} />
      </ActionIcon>
    </Group>
  )
}

export default ListingExpense
