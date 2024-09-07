import React, { useState } from 'react'
import {
  createStyles,
  Radio,
  Group,
  Button,
  Flex,
  Box,
  Title,
  Space,
  Collapse,
  ActionIcon,
  Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import type { ICannedMessage } from 'types/automations'

const useStyles = createStyles(() => ({
  card: {
    width: '100%',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #D2D5DA',
    padding: '16px',
  },
  radio: { marginRight: '8px', marginTop: '4px' },
  line: {
    margin: 0,
  },
}))

interface Props {
  automations: Array<ICannedMessage> | undefined
  onSelected: (body: string) => void
}

const Message = ({ automations, onSelected }: Props) => {
  const { classes } = useStyles()
  const [selectedAutomationId, setSelectedAutomationId] = useState<string>()
  const [open, { toggle }] = useDisclosure(false)

  const getIcon = () => {
    if (open) {
      return <IconChevronUp size="1rem" />
    }
    return <IconChevronDown size="1rem" />
  }
  // const brokenByLine = automations[0].body.split('\n')
  // // .map((line, index) => console.log(line))
  // console.log(brokenByLine)

  return (
    <>
      <Radio.Group
        name="Select a canned message"
        w={'100%'}
        value={selectedAutomationId}
        onChange={(value) => {
          setSelectedAutomationId(value)
        }}
      >
        <Group mt="xs" w={'100%'}>
          {automations?.length &&
            automations?.map((automation) => (
              <Box key={automation.id} className={classes.card}>
                <Flex direction={'row'} align={'flex-start'}>
                  <Radio value={automation.id} className={classes.radio} />
                  <Flex direction={'column'} align={'flex-start'} w={'100%'}>
                    <Flex
                      direction={'row'}
                      align={'center'}
                      justify={'space-between'}
                      w={'100%'}
                    >
                      <Title order={2}>{automation.title}</Title>
                      <ActionIcon onClick={toggle}>{getIcon()}</ActionIcon>
                    </Flex>
                    <Space h="xs" />
                    {!(automation.id === selectedAutomationId) && (
                      <Text lineClamp={1}>{automation.body}</Text>
                    )}
                    <Collapse in={automation.id === selectedAutomationId}>
                      {automation.body.split('\n').map((line, index) =>
                        line === '' ? (
                          <Space h="md" key={index} />
                        ) : (
                          <p className={classes.line} key={index}>
                            {line}
                          </p>
                        )
                      )}
                    </Collapse>
                  </Flex>
                </Flex>
              </Box>
            ))}
          {!automations?.length && <p>No canned messages found</p>}
        </Group>
      </Radio.Group>
      <Flex justify="flex-end" mt="md">
        <Button
          onClick={() => {
            const automation = automations?.find(
              (automation) => automation.id === selectedAutomationId
            )
            if (automation) onSelected(automation.body)
          }}
          disabled={!selectedAutomationId}
        >
          Next
        </Button>
      </Flex>
    </>
  )
}

export default Message
