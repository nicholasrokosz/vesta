import { Text, Space } from '@mantine/core'
import Linkify from 'components/common/Linkify/Linkify'

export const addLineBreaks = (text: string) => {
  return (
    <>
      {' '}
      {text.split('\n').map((line, index) =>
        line === '' ? (
          <Space h="sm" key={index} />
        ) : (
          <Text m={0} key={index}>
            <Linkify>{line}</Linkify>
          </Text>
        )
      )}
    </>
  )
}
