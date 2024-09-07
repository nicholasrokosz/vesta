import {
  Text,
  createStyles,
  Stack,
  Button,
  TextInput,
  Flex,
  Select,
  NumberInput,
  Radio,
} from '@mantine/core'
import type { MessageTemplateCreate } from 'types/automations'
import { TriggerUnits } from 'types/automations'
import { TriggerRanges } from 'types/automations'
import { Triggers } from 'types/automations'
import { MessageTemplateCreateSchema } from 'types/automations'
import { useForm, zodResolver } from '@mantine/form'
import { useEffect, useState } from 'react'
import type {
  TriggerRangeType,
  TriggerType,
  TriggerUnitType,
} from '../../../prisma/generated/zod'
import SelectListings from 'components/listings/SelectListing/Multi'
import TextEditor from '../common/TextEditor/TextEditor'

const useStyles = createStyles((theme) => ({
  form: {
    width: 740,
    paddingTop: 50,
  },
  header: {
    fontSize: 15,
    fontWeight: 600,
  },
  text: {
    color: theme.colors.neutral[4],
    fontSize: 12,
    lineHeight: '140%',
    paddingBottom: 10,
  },
}))

interface Props {
  messageTemplate?: MessageTemplateCreate | null
  onSubmit: (data: MessageTemplateCreate) => void
}

const NewMessageTemplate = ({ messageTemplate, onSubmit }: Props) => {
  const { classes } = useStyles()
  const [showTrigger, setShowTrigger] = useState<boolean>(false)
  const [trigger, setTrigger] = useState<TriggerType | null>()
  const [triggerRange, setTriggerRange] = useState<TriggerRangeType | null>()
  const [triggerUnit, setTriggerUnit] = useState<TriggerUnitType | null>()
  const [triggerValue, setTriggerValue] = useState<number | ''>('')
  const [chooseListings, setChooseListings] = useState<string>('all')
  const [selectedListings, setSelectedListings] = useState<
    string[] | undefined
  >(undefined)
  const form = useForm<MessageTemplateCreate>({
    validate: zodResolver(MessageTemplateCreateSchema),
  })

  useEffect(() => {
    if (messageTemplate) {
      form.setValues(messageTemplate)
      if (messageTemplate.trigger) {
        setShowTrigger(true)
        setTrigger(messageTemplate.trigger)
        setTriggerRange(messageTemplate.triggerRange)
        setTriggerUnit(messageTemplate.triggerUnit)
        setTriggerValue(messageTemplate.triggerValue ?? 0)
      }

      if (!messageTemplate.allListings) {
        setChooseListings('specific')
        setSelectedListings(messageTemplate.listingIds)
      }
    }
  }, [messageTemplate])

  useEffect(() => {
    console.log('form.errors', form.errors)
  }, [form.errors])

  useEffect(() => {
    if (triggerRange == 'Immediately') {
      setTriggerUnit(null)
      setTriggerValue('')
    }
  }, [triggerRange])

  useEffect(() => {
    form.setFieldValue('allListings', chooseListings === 'all')
  }, [chooseListings])

  const submitForm = (values: MessageTemplateCreate) => {
    onSubmit({
      ...values,
      trigger,
      triggerRange,
      triggerUnit,
      triggerValue: triggerValue === '' ? 0 : triggerValue,
      listingIds: selectedListings,
    })
  }

  return (
    <form
      onSubmit={form.onSubmit((values) => submitForm(values))}
      className={classes.form}
    >
      <Stack spacing="xl">
        <TextInput
          label={
            <Stack spacing="xs">
              <Text className={classes.header}>Template Title</Text>
              <Text className={classes.text}>
                Create a title that helps you to recognise this template.
              </Text>
            </Stack>
          }
          placeholder="e.g. Welcome message"
          {...form.getInputProps('title')}
        />

        {showTrigger && (
          <>
            <Stack spacing="xs">
              <Text className={classes.header}>Trigger</Text>
              <Text className={classes.text}>
                Choose the trigger that will activate your message template. Set
                the time delay for when the message should be sent after the
                trigger has been activated.
              </Text>
            </Stack>
            <Flex align="center" gap="md">
              <Text>Send message</Text>
              {triggerRange != 'Immediately' && (
                <>
                  <NumberInput
                    w={60}
                    value={triggerValue ?? 1}
                    onChange={(value) => setTriggerValue(value)}
                    min={1}
                    required
                  />
                  <Select
                    w={100}
                    data={TriggerUnits}
                    value={triggerUnit}
                    onChange={(value) =>
                      setTriggerUnit(value as TriggerUnitType)
                    }
                  />
                </>
              )}

              <Select
                w={150}
                defaultValue={'Immediately'}
                data={TriggerRanges}
                value={triggerRange}
                onChange={(value) => setTriggerRange(value as TriggerRangeType)}
              />

              {triggerRange === 'Immediately' && <Text>after</Text>}

              <Select
                w={160}
                name="trigger"
                placeholder="Select a trigger"
                data={Triggers}
                value={trigger}
                onChange={(value) => setTrigger(value as TriggerType)}
              />
            </Flex>
            <Button
              w={120}
              color="red"
              variant="subtle"
              onClick={() => {
                setShowTrigger(false)
                setTrigger(null)
                setTriggerRange(null)
                setTriggerUnit(null)
                setTriggerValue('')
              }}
            >
              Remove
            </Button>
          </>
        )}

        {!showTrigger && (
          <Button
            w={150}
            variant="subtle"
            onClick={() => {
              setShowTrigger(true)
              setTriggerRange('Immediately')
            }}
          >
            + Add Trigger
          </Button>
        )}

        <TextEditor
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          body={form.getInputProps('bodyHtml').value ?? ''}
          setBody={(value: string, valueHtml: string) => {
            form.setFieldValue('body', value)
            form.setFieldValue('bodyHtml', valueHtml)
          }}
        />

        <Stack spacing="xs">
          <Text className={classes.header}>Choose property</Text>
          <Text className={classes.text}>
            Select the property or you want to use template message for.
          </Text>
          <Radio.Group
            value={chooseListings}
            onChange={setChooseListings}
            w={150}
          >
            <Radio label="All listings" color="vesta" value="all" mb={16} />
            <Radio label="Specific listings" color="vesta" value="specific" />
          </Radio.Group>
          {chooseListings === 'specific' && (
            <SelectListings
              excludeIds={[]}
              selectedIds={selectedListings}
              onSelect={setSelectedListings}
            />
          )}
        </Stack>
      </Stack>

      <Flex justify={'flex-end'} pt={30}>
        <Button variant="subtle" component="a" href={'/automations'}>
          Cancel
        </Button>
        <Button type="submit">
          {messageTemplate ? 'Save' : 'Create template'}
        </Button>
      </Flex>
    </form>
  )
}

export default NewMessageTemplate
