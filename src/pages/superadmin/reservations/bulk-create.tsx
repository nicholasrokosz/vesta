import { type NextPage } from 'next'
import { Button, FileInput, Flex } from '@mantine/core'
import { api } from 'utils/api'
import { useState } from 'react'
import { Channel } from '@prisma/client'

const Index: NextPage = () => {
  const [file, setFile] = useState<File | null>(null)
  const mutation = api.calendar.bulkCreateReservations.useMutation()

  const lineToObj = (line: string) => {
    const [
      exists,
      guestName,
      fromDate,
      toDate,
      bookedOn,
      listingName,
      channel,
      confirmationCode,
      email,
      phone,
    ] = line.split(',')

    return {
      exists,
      guestName,
      fromDate,
      toDate,
      bookedOn,
      listingName,
      channel,
      confirmationCode,
      email,
      phone,
    }
  }

  const wyuflp = async (file: File | null) => {
    if (!file) return

    const text = await file.text()
    const lines = text.split('\r\n').slice(1)
    const objs = lines
      .map((line) => lineToObj(line))
      .filter(
        ({ exists, listingName }) =>
          exists === 'FALSE' && listingName !== '#N/A'
      )
      .map(
        ({
          guestName,
          fromDate,
          toDate,
          bookedOn,
          listingName,
          channel,
          confirmationCode,
          email,
          phone,
        }) => ({
          guestName,
          fromDate,
          toDate,
          bookedOn,
          listingName,
          channel: Channel[channel as keyof typeof Channel],
          confirmationCode,
          email,
          phone,
        })
      )
    mutation.mutate(objs)
    console.log(objs)
  }

  return (
    <Flex gap="md">
      <FileInput
        placeholder="Upload CSV"
        w={300}
        value={file}
        accept="text/csv"
        onChange={setFile}
      />
      <Button onClick={() => void wyuflp(file)}>Submit</Button>
    </Flex>
  )
}

export default Index
