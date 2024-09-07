import {
  Stack,
  Title,
  TextInput,
  Textarea,
  Flex,
  Button,
  createStyles,
  Table,
  Text,
  Alert,
  Box,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useEffect, useRef, useState } from 'react'
import { api } from 'utils/api'
import ImageUpload from '../../ImageUpload/ImageUpload'
import type { Bedroom } from 'types/listings'
import { Content } from 'types/listings'
import { useListState } from '@mantine/hooks'
import BedroomRow from './BedroomRow'
import { v4 as uuidv4 } from 'uuid'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import { IconAlertCircle } from '@tabler/icons-react'

const useStyles = createStyles((theme) => ({
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
  table: {
    marginTop: 10,
    marginBottom: 20,
    border: '1px solid',
    borderColor: theme.colors.neutral[3],
  },
  tableHeader: {
    backgroundColor: theme.colors.neutral[2],
  },
  errors: {
    color: theme.colors.red[4],
  },
  errorList: {
    marginTop: 0,
  },
}))

interface Props {
  onSuccess: () => void
  onError: () => void
  listingId: string
  buttonText: string
}

const Content = ({ onSuccess, onError, listingId, buttonText }: Props) => {
  const { classes } = useStyles()
  const mutation = api.listing.upsertContent.useMutation()
  const { data, isLoading, refetch } = api.listing.getContent.useQuery({
    listingId,
  })
  const { data: detailsData } = api.listing.getDetails.useQuery({
    id: listingId ?? '',
  })

  const [photos, setPhotos] = useState<string[]>([])
  const [bedrooms, bedroomsHandlers] = useListState<Bedroom>([
    { type: 'Bedroom', beds: ['RMA86'] },
  ])
  const [requiredBedrooms, setRequiredBedrooms] = useState<number>(0)
  const [photoError, setPhotoError] = useState<string>()
  const [alertText, setAlertText] = useState<string>('')

  const alertRef = useRef<HTMLDivElement>(null)

  const form = useForm<Content>({
    validate: (values) => ({
      photos: photos.length < 1 ? 'At least one photo is required.' : undefined,
      title: !values.title ? 'Title is required.' : undefined,
      description: !values.description ? 'Description is required.' : undefined,
      bedrooms: bedroomsIsInValid() ? `Error` : undefined,
    }),
  })

  const bedroomsIsInValid = () => {
    const actualBedrooms = bedrooms.filter(
      (bedroom) => bedroom.type === 'Bedroom'
    )

    return (
      // Do not include other room types when checking for required bedrooms
      actualBedrooms.length < requiredBedrooms ||
      actualBedrooms.length > requiredBedrooms ||
      // but do include other room types when verifying that each toom has at least one bed
      bedrooms.some((bedroom) => bedroom.beds.some((bed) => bed === ''))
    )
  }

  useEffect(() => {
    if (detailsData) {
      setRequiredBedrooms(detailsData.beds)
    }
  }, [detailsData])

  useEffect(() => {
    if (data) {
      form.setValues(data)
      setPhotos(data.photos)
      bedroomsHandlers.setState(data.bedrooms)
    } else {
      form.setFieldValue('listingId', listingId)
    }
  }, [data])

  useEffect(() => {
    if (mutation.isSuccess) {
      void refetch()
      onSuccess()
    }
    if (mutation.isError) {
      onError()
    }
  }, [mutation.isSuccess, mutation.isError])

  useEffect(() => {
    form.setFieldValue('photos', photos)
  }, [photos])

  useEffect(() => {
    form.setFieldValue('bedrooms', bedrooms)
  }, [bedrooms])

  useEffect(() => {
    setAlertText(
      Object.keys(form.errors)
        .map((str) => requiredFieldsMap[str])
        .join(', ')
    )
  }, [form.errors])

  const requiredFieldsMap: { [key: string]: string } = {
    photos: 'Listing photos',
    title: 'Property title',
    description: 'Description',
    bedrooms: `${requiredBedrooms} bedrooms with at least one bed each are required for this listing.`,
  }

  return (
    <div className="loading-spinner-container">
      <VestaSpinnerOverlay visible={isLoading || mutation.isLoading} />
      <Box ref={alertRef} pt="sm" mb="sm">
        {alertText && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Please provide values for the following required fields:"
            color="red"
          >
            {alertText}
          </Alert>
        )}
      </Box>
      <form
        onSubmit={form.onSubmit(
          (values) => mutation.mutate(values),
          () => {
            alertRef.current?.scrollIntoView({ behavior: 'smooth' })
          }
        )}
      >
        <Flex justify={'flex-end'}>
          <Button type="submit">{buttonText}</Button>
        </Flex>
        <Stack className={classes.stack}>
          <Title order={3}>Listing Photos</Title>

          {photoError && (
            <Text weight={700} className={classes.errors}>
              {photoError}
            </Text>
          )}

          <ImageUpload
            photos={photos}
            setPhotos={setPhotos}
            onError={setPhotoError}
          />

          <TextInput
            w={'80%'}
            label={
              <Title order={3} className={classes.header}>
                Property Title
              </Title>
            }
            {...form.getInputProps('title')}
          />
          <Textarea
            w={'80%'}
            autosize
            minRows={4}
            label={
              <Title order={3} className={classes.header}>
                Description
              </Title>
            }
            placeholder="Enter your description here"
            {...form.getInputProps('description')}
          />
          <Textarea
            w={'80%'}
            minRows={10}
            autosize
            label={
              <Title order={3} className={classes.header}>
                AI support info
              </Title>
            }
            placeholder="Enter listing details to inform AI support"
            {...form.getInputProps('aiInfo')}
          />
        </Stack>

        <Title order={3} pb={10}>
          Bedrooms
        </Title>
        <div>
          {bedrooms.length > 0 && (
            <Table w={550} className={classes.table} striped={true}>
              <thead>
                <tr className={classes.tableHeader}>
                  <th>Type</th>
                  <th>Private bathroom?</th>
                  <th>Beds</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bedrooms.map((bedroom, index) => (
                  <BedroomRow
                    key={uuidv4()}
                    bedroom={bedroom}
                    remove={() => bedroomsHandlers.remove(index)}
                    onChange={(value: Bedroom) => {
                      bedroomsHandlers.setItem(index, value)
                    }}
                  />
                ))}
              </tbody>
            </Table>
          )}
          <Button
            onClick={() =>
              bedroomsHandlers.append({ type: 'Bedroom', beds: ['RMA86'] })
            }
          >
            Add a room
          </Button>
        </div>

        <Flex justify={'flex-end'}>
          <Button type="submit">{buttonText}</Button>
        </Flex>
      </form>
    </div>
  )
}

export default Content
