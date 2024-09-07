import { useEffect, useState } from 'react'
import { useForm, zodResolver } from '@mantine/form'
import { DatePickerInput } from '@mantine/dates'
import {
  IconCurrencyDollar,
  IconFileInvoice,
  IconReceipt,
  IconLock,
} from '@tabler/icons-react'
import {
  createStyles,
  Stack,
  Button,
  TextInput,
  Flex,
  Select,
  Group,
  NumberInput,
  Title,
  Text,
  Badge,
  Center,
  Space,
} from '@mantine/core'
import { v4 as uuidv4 } from 'uuid'

import ListingExpense from './ListingExpense/ListingExpense'
import type { ExpenseCreate, ListingExpenseCreate } from 'types/expenses'
import { ExpenseCreateSchema } from 'types/expenses'
import { api } from 'utils/api'
import FileUpload from './FileUpload/FileUpload'
import Link from 'next/link'
import vestaInvoiceUtil from 'utils/vestaInvoice'
import { useRouter } from 'next/router'

const useStyles = createStyles((theme) => ({
  form: {
    width: 760,
    paddingTop: theme.spacing.xl,
  },
  header: {
    fontSize: 15,
    fontWeight: 600,
  },
  link: {
    '&:hover': {
      cursor: 'pointer',
    },
    textDecoration: 'none',
    color: theme.colors.gray[7],
  },
}))

interface Props {
  onSubmit: (data: ExpenseCreate) => void
  expense?: ExpenseCreate
  ownerStatementLocked?: boolean
}

const NewExpense = ({ onSubmit, expense, ownerStatementLocked }: Props) => {
  const { classes } = useStyles()
  const router = useRouter()

  const propertyManagers = api.user.getPropertyManagers.useQuery()

  const [error, setError] = useState<boolean | 'duplicatelisting'>(false)
  const [invoiceUrl, setInvoiceUrl] = useState<string>('')
  const [receiptUrl, setReceiptUrl] = useState<string>('')

  const getFreshListingExpense = () => {
    return {
      id: uuidv4(),
      listingId: '',
      amount: 0,
      amountPaid: 0,
      confirmationCode: '',
    }
  }

  const [listingExpenses, setListingExpenses] = useState<
    ListingExpenseCreate[]
  >(
    expense
      ? expense.listingExpenses.length > 0
        ? expense.listingExpenses.map((le) => {
            return {
              id: le.id,
              listingId: le.listingId,
              amount: le.amount,
              amountPaid: le.amountPaid,
              confirmationCode: le.confirmationCode,
            }
          })
        : [getFreshListingExpense()]
      : [getFreshListingExpense()]
  )

  const form = useForm<ExpenseCreate>({
    validate: zodResolver(ExpenseCreateSchema),
  })

  const addListing = () => {
    setListingExpenses([...listingExpenses, getFreshListingExpense()])
  }

  useEffect(() => {
    if (expense) {
      form.setValues({
        ...expense,
        receiptUrl,
        invoiceUrl,
        listingExpenses,
      })
      if (expense.receiptUrl) setReceiptUrl(expense.receiptUrl)
      if (expense.invoiceUrl) setInvoiceUrl(expense.invoiceUrl)
    }
  }, [])

  useEffect(() => {
    form.setValues({
      ...form.values,
      receiptUrl,
      invoiceUrl,
      listingExpenses,
    })
  }, [listingExpenses])

  const checkListingsUnique = () => {
    const listingIds = listingExpenses.map((le) => le.listingId)
    const uniqueListingIds = [...new Set(listingIds)]
    return listingIds.length === uniqueListingIds.length
  }

  const submitForm = () => {
    const listingsUnique = checkListingsUnique()
    form.validate()
    if (form.isValid() && listingsUnique) {
      setError(false)
      onSubmit({
        ...form.values,
        receiptUrl,
        invoiceUrl,
        listingExpenses,
      })
    } else {
      if (!listingsUnique) {
        setError('duplicatelisting')
      } else setError(true)
      console.log(form.errors)
    }
  }

  return (
    <>
      {ownerStatementLocked && (
        <>
          <Space h="xl" />
          <Badge
            size="xl"
            radius="xl"
            color="vesta"
            variant="light"
            bg="vesta.1"
            leftSection={
              <Center>
                <IconLock size={18} />
              </Center>
            }
          >
            locked
          </Badge>
        </>
      )}
      <form className={classes.form}>
        <Stack spacing="lg" align="flex-start">
          <Group spacing="lg">
            <DatePickerInput
              label="Date"
              placeholder="Pick date"
              {...form.getInputProps('date')}
              w={180}
              withAsterisk
            />
            <TextInput
              label="Vendor"
              placeholder="Enter vendor"
              {...form.getInputProps('vendor')}
              withAsterisk
              w={250}
            />
            <NumberInput
              label="Total amount"
              {...form.getInputProps('amount')}
              icon={<IconCurrencyDollar size={16} />}
              iconWidth={25}
              hideControls
              precision={2}
              withAsterisk
            />
          </Group>

          <Stack align="flex-start">
            {listingExpenses.length > 0 &&
              listingExpenses.map((le) => (
                <ListingExpense
                  key={le.id}
                  expense={le}
                  setExpense={(expense: ListingExpenseCreate) => {
                    const ListingExpense = listingExpenses.find((le) => {
                      return le.id === expense.id
                    })
                    if (ListingExpense) {
                      ListingExpense.listingId = expense.listingId
                      ListingExpense.amount = expense.amount
                      ListingExpense.amountPaid = expense.amountPaid
                      ListingExpense.confirmationCode = expense.confirmationCode
                    }
                  }}
                  error={error}
                  onDelete={(listingExpenseId: string) => {
                    const ListingExpense = listingExpenses.find((le) => {
                      return le.id === listingExpenseId
                    })
                    if (ListingExpense) {
                      setListingExpenses(
                        listingExpenses.filter((le) => {
                          return le.id !== listingExpenseId
                        })
                      )
                    }
                  }}
                />
              ))}

            <Button variant="subtle" onClick={() => addListing()}>
              + Add Listing
            </Button>
          </Stack>

          <Group>
            <TextInput
              w={300}
              label="Description"
              {...form.getInputProps('description')}
            />
            {propertyManagers?.data && (
              <Select
                label="Team member"
                placeholder="Pick team member"
                data={propertyManagers.data.map(
                  (pm: { id: string; name: string | null }) => {
                    return { value: pm.id, label: pm.name || '' }
                  }
                )}
                searchable
                {...form.getInputProps('userId')}
              />
            )}

            <TextInput
              {...form.getInputProps('workOrder')}
              w={200}
              label="Work order #"
              placeholder="Enter work order #"
            />
          </Group>

          <Stack spacing={'sm'}>
            <Stack spacing={'xs'}>
              <Title order={1}>Documents</Title>
              <Text fs={'xs'}>accepted file types: png, jpg, pdf</Text>
            </Stack>
            {invoiceUrl ? (
              <Group>
                <Link
                  target="_blank"
                  href={vestaInvoiceUtil.getFile(invoiceUrl)}
                  className={classes.link}
                >
                  <IconFileInvoice size={28} />
                </Link>
                <Text>Invoice</Text>
                <Button
                  variant="subtle"
                  onClick={() => setInvoiceUrl('')}
                  ml={3}
                >
                  Remove
                </Button>
              </Group>
            ) : (
              <Group>
                <FileUpload
                  key="invoice"
                  label="Upload Invoice"
                  setDocument={setInvoiceUrl}
                />
              </Group>
            )}
            {receiptUrl ? (
              <Group>
                <Link
                  target="_blank"
                  href={vestaInvoiceUtil.getFile(receiptUrl)}
                  className={classes.link}
                >
                  <IconReceipt size={28} />
                </Link>
                <Text>Receipt</Text>
                <Button variant="subtle" onClick={() => setReceiptUrl('')}>
                  Remove
                </Button>
              </Group>
            ) : (
              <Group>
                <FileUpload
                  key="receipt"
                  label="Upload Receipt"
                  setDocument={setReceiptUrl}
                />
              </Group>
            )}
          </Stack>

          <Flex justify={'flex-end'} pt={30} w={'100%'}>
            <Button
              variant="subtle"
              component="a"
              onClick={() => void router.back()}
            >
              Cancel
            </Button>
            <Button onClick={submitForm} disabled={ownerStatementLocked}>
              {expense ? 'Save' : 'Create'}
            </Button>
          </Flex>
        </Stack>
      </form>
    </>
  )
}

export default NewExpense
