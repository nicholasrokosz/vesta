import {
  Stack,
  Title,
  Text,
  Textarea,
  Flex,
  Button,
  createStyles,
  Checkbox,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useEffect } from 'react'
import type { RulesCreate } from 'types'
import { RulesCreateSchema } from 'types'
import { api } from 'utils/api'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'

const useStyles = createStyles(() => ({
  stack: {
    paddingBottom: 26,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  rulesCheck: {
    paddingTop: 4,
    paddingRight: 10,
  },
  rules: {
    fontWeight: 'normal',
    paddingBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: -6,
  },
  description: {
    paddingLeft: 32,
  },
}))

interface Props {
  onSuccess: () => void
  onError: () => void
  listingId: string
  buttonText: string
}

const Rules = ({ onSuccess, onError, listingId, buttonText }: Props) => {
  const { classes } = useStyles()
  const mutation = api.listing.upsertRules.useMutation()
  const { data, isLoading } = api.listing.getRules.useQuery({ listingId })

  const form = useForm<RulesCreate>({
    validate: zodResolver(RulesCreateSchema),
  })

  useEffect(() => {
    if (data) form.setValues(data)
    else form.setFieldValue('listingId', listingId)
  }, [data])

  useEffect(() => {
    if (mutation.isSuccess) {
      onSuccess()
    }
    if (mutation.isError) {
      onError()
    }
  }, [mutation.isSuccess, mutation.isError])

  return (
    <div className="loading-spinner-container">
      <VestaSpinnerOverlay visible={isLoading || mutation.isLoading} />
      <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
        <Flex justify={'flex-end'}>
          <Button type="submit">{buttonText}</Button>
        </Flex>
        <Stack className={classes.stack}>
          <Title order={3} className={classes.header}>
            House Rules (Optional)
          </Title>
          <Text className={classes.rules}>
            Guests must agree to your house rules before they book.
          </Text>

          <Flex direction="column">
            <Checkbox
              className={classes.rulesCheck}
              label={
                <>
                  <Text className={classes.label}>
                    Not suitable for children
                  </Text>
                </>
              }
              {...form.getInputProps('children', { type: 'checkbox' })}
            />
            <Stack spacing="xs">
              <Text className={classes.description}>
                You can let guests know that your place isn&apos;t suitable for
                children if there are any features which are dangerous for them.
                Guests will still be able to reach out for more details.
              </Text>
            </Stack>
          </Flex>

          <Flex direction="column">
            <Checkbox
              className={classes.rulesCheck}
              label={
                <>
                  <Text className={classes.label}>Pets allowed</Text>
                </>
              }
              {...form.getInputProps('pets', { type: 'checkbox' })}
            />
            <Stack spacing="xs">
              <Text className={classes.description}>
                You can prevent guests from bringing pets, but you must
                reasonably accommodate guests that might bring an assistant
                animal.
              </Text>
            </Stack>
          </Flex>

          <Flex direction="column">
            <Checkbox
              className={classes.rulesCheck}
              label={
                <>
                  <Text className={classes.label}>Smoking allowed</Text>
                </>
              }
              {...form.getInputProps('smoking', { type: 'checkbox' })}
            />
          </Flex>

          <Flex direction="column">
            <Checkbox
              className={classes.rulesCheck}
              label={
                <>
                  <Text className={classes.label}>Security deposit</Text>
                </>
              }
              {...form.getInputProps('deposit', { type: 'checkbox' })}
            />
            <Stack spacing="xs">
              <Text className={classes.description}>
                Stays at this listing require a security deposit.
              </Text>
            </Stack>
          </Flex>

          <Textarea
            w={500}
            autosize
            minRows={6}
            label={<Title className={classes.header}>Custom Rules</Title>}
            placeholder="Enter your rules here"
            {...form.getInputProps('house')}
          />
        </Stack>

        <Flex justify={'flex-end'}>
          <Button type="submit">{buttonText}</Button>
        </Flex>
      </form>
    </div>
  )
}

export default Rules
