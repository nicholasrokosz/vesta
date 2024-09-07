import { useEffect, useState } from 'react'
import type { SyntheticEvent } from 'react'
import {
  createStyles,
  Title,
  Stack,
  TextInput,
  Image,
  Table,
  ScrollArea,
  Flex,
  Button,
  Checkbox,
  Group,
  SegmentedControl,
  Box,
  Divider,
} from '@mantine/core'
import VestaModal from 'components/common/Modal/Modal'
import {
  IconBarbell,
  IconCampfire,
  IconCircleNumber8,
  IconFlame,
  IconFountain,
  IconGrill,
  IconSearch,
  IconSwimming,
  IconToolsKitchen2,
} from '@tabler/icons-react'
import AmenityRow from './AmenityRow'
import type * as types from 'types'
import { amenityCategories } from 'types'
import { api } from 'utils/api'
import possibleAmenities from 'utils/amenities'
import SelectListing from 'components/listings/SelectListing/Single'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import CoreAmenitiesSection from './CoreAmenitiesSection'

const useStyles = createStyles((theme) => ({
  stack: {
    paddingBottom: 26,
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
    border: '1px solid',
    borderColor: theme.colors.neutral[3],
  },
  tableScroll: {
    height: 555,
    width: 615,
  },
  controlsScroll: {
    height: 590,
  },
  section: {
    color: theme.colors.neutral[4],
  },
  label: {
    fontWeight: 700,
    paddingRight: 15,
    fontSize: theme.fontSizes.xl,
  },
  asterisk: {
    color: theme.colors.red[4],
    fontSize: 11,
    position: 'relative',
    bottom: 2,
  },
  plusIcon: {
    color: theme.colors.vesta[4],
  },
  tableControls: {
    background: 'white',
  },
  categoryControls: {
    border: 'none !important',
  },
  categoryLabels: {
    textAlign: 'left',
  },
}))

const amenityButtonInfo = [
  {
    name: 'Pool',
    typeId: 'HAC71,HAC6086',
    icon: <IconSwimming />,
    selected: false,
  },
  {
    name: 'BBQ grill',
    typeId: 'RMA8',
    icon: <IconGrill />,
    selected: false,
  },
  {
    name: 'Fire pit',
    typeId: 'HAC6066',
    icon: <IconCampfire />,
    selected: false,
  },
  {
    name: 'Pool table',
    typeId: 'RST111',
    icon: <IconCircleNumber8 />,
    selected: false,
  },
  {
    name: 'Hot tub',
    typeId: 'HAC55,RST104',
    icon: (
      <Image maw={24} fit={'fill'} src="/icon-hot-tub.svg" alt="Hot tub icon" />
    ),
    selected: false,
  },
  {
    name: 'Outdoor dining area',
    typeId: 'HAC6082',
    icon: <IconToolsKitchen2 />,
    selected: false,
  },
  {
    name: 'Gym',
    typeId: 'HAC6067,HAC345,RST35,HAC6184',
    icon: <IconBarbell />,
    selected: false,
  },
  {
    name: 'Indoor fireplace',
    typeId: 'RMA6158',
    icon: <IconFlame />,
    selected: false,
  },
  {
    name: 'Patio',
    typeId: 'RMA7',
    icon: <IconFountain />,
    selected: false,
  },
]
// {
//   title: 'Guest Favorites',
//   amenities: [
//     'High-speed WiFi',
//     'TV',
//     'Kitchen',
//     'Onsite laundry',
//     'Free parking',
//     'Air conditioning',
//     'Outdoor shower',
//   ],
// },
// {
//   title: 'Household essentials',
//   amenities: [
//     'Towels available',
//     'Soap/Shampoo',
//     'Hairdryer',
//     'Cooking basics',
//   ],
// },
// {
//   title: 'Peace of mind',
//   amenities: [
//     'Smoke detectors',
//     'Carbon monoxide detector',
//     'First aid kit',
//     'Fire extinguishers',
//   ],
// },

const modifiedPossibleAmenities = possibleAmenities
  .map((amenity) => ({
    typeId: amenity.typeIds.join(','),
    name: amenity.name,
    categories: amenity.categories,
    checked: false,
    note: '',
  }))
  .sort((a, b) => (a.name < b.name ? -1 : 1))

interface Props {
  onSuccess: () => void
  onError: () => void
  listingId: string
  buttonText: string
}

const NewAmenities = ({ onSuccess, onError, listingId, buttonText }: Props) => {
  const { classes } = useStyles()
  const [amenities, setAmenities] = useState<types.IAmenity[]>(
    modifiedPossibleAmenities
  )
  const [filter, setFilter] = useState<string>('')
  const [onlyIncluded, setOnlyIncluded] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [copyListingId, setCopyListingId] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [amenityButtons, setAmenityButtons] = useState(amenityButtonInfo)

  const upsertMutation = api.listing.upsertAmenity.useMutation()
  const {
    data: listingAmenities,
    isLoading: amenitiesLoading,
    refetch,
  } = api.listing.getAmenities.useQuery({
    listingId,
  })
  const { data: copyListingAmenities, isLoading: copyLoading } =
    api.listing.getAmenities.useQuery({
      listingId: copyListingId,
    })

  const populateAmenities = (
    amenitiesList: { typeId: string; note: string | null }[]
  ) => {
    const amenitiesCopy = [...amenities]
    amenitiesList.forEach(({ typeId, note }) => {
      const index = amenitiesCopy.findIndex(
        (amenity) => amenity.typeId === typeId
      )
      amenitiesCopy[index] = {
        ...amenitiesCopy[index],
        checked: true,
        note: String(note),
      }
    })
    setAmenities(amenitiesCopy)

    const buttonsCopy = [...amenityButtons]
    amenitiesList.forEach((savedAmenity) => {
      buttonsCopy.forEach((amenityButton, index) => {
        if (savedAmenity.typeId === amenityButton.typeId) {
          buttonsCopy[index] = { ...buttonsCopy[index], selected: true }
        }
      })
    })
    setAmenityButtons(buttonsCopy)
  }

  // TODO: Consider updating table and button amenities in each sync function
  const syncAmenitiesTable = (typeId: string, checked: boolean) => {
    const index = amenities.findIndex((amenity) => amenity.typeId === typeId)

    const copy = [...amenities]
    copy[index] = { ...copy[index], checked }
    setAmenities(copy)
  }

  const syncAmenityButtons = (typeId: string, selected: boolean) => {
    const index = amenityButtons.findIndex(
      (amenity) => amenity.typeId === typeId
    )

    if (index === -1) return

    const copy = [...amenityButtons]
    copy[index] = { ...copy[index], selected }
    setAmenityButtons(copy)
  }

  useEffect(() => {
    if (listingAmenities && listingAmenities.length > 0) {
      populateAmenities(listingAmenities)
    }
  }, [listingAmenities])

  useEffect(() => {
    if (copyListingAmenities && copyListingAmenities.length > 0) {
      populateAmenities(copyListingAmenities)
    }
  }, [copyListingAmenities])

  useEffect(() => {
    if (upsertMutation.isSuccess) {
      void refetch()
      onSuccess()
    }
    if (upsertMutation.isError) {
      onError()
    }
  }, [upsertMutation.isSuccess, upsertMutation.isError])

  const filterAmenities = ({ name }: types.IAmenity) =>
    name.toLowerCase().includes(filter.toLocaleLowerCase())

  const categoryFilter = ({ categories }: types.IAmenity) =>
    selectedCategory === 'All' || categories?.includes(selectedCategory)

  const submitForm = (e: SyntheticEvent) => {
    e.preventDefault()

    const checkedAmenities = amenities
      .filter(({ checked }) => checked)
      .map(({ typeId, note }) => ({
        typeId,
        note,
      }))

    const newListing: types.AmenityUpdate = {
      id: listingId,
      amenities: { createMany: { data: checkedAmenities } },
    }
    upsertMutation.mutate(newListing)
  }

  return (
    <div className="loading-spinner-container">
      <VestaSpinnerOverlay
        visible={amenitiesLoading || copyLoading || upsertMutation.isLoading}
      />
      <form onSubmit={submitForm}>
        <Flex justify={'flex-end'}>
          <Button type="submit">{buttonText}</Button>
        </Flex>
        <Stack className={classes.stack} maw={1150}>
          <CoreAmenitiesSection
            amenities={amenityButtons}
            setAmenityButtons={setAmenityButtons}
            syncAmenitiesTable={syncAmenitiesTable}
          />
          <Group position="apart" mt={16}>
            <Title order={2}>All amenities</Title>
            <Button onClick={() => setShowModal(true)}>
              Import from another listing
            </Button>
            <VestaModal
              opened={showModal}
              onClose={() => setShowModal(false)}
              size={500}
              title="Import from another listing"
            >
              <Flex
                gap="xl"
                justify="flex-start"
                align="flex-end"
                direction="row"
                wrap="wrap"
              >
                <SelectListing
                  excludeIds={[listingId]}
                  onSelect={setSelectedId}
                />
                <Button
                  component="a"
                  onClick={() => {
                    if (selectedId) setCopyListingId(selectedId)
                    setShowModal(false)
                  }}
                >
                  Import
                </Button>
              </Flex>
            </VestaModal>
          </Group>
          <Flex>
            <ScrollArea
              miw={200}
              className={classes.controlsScroll}
              type="auto"
            >
              <SegmentedControl
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e)
                  setFilter('')
                }}
                classNames={{
                  root: classes.tableControls,
                  control: classes.categoryControls,
                  label: classes.categoryLabels,
                }}
                color="vesta"
                orientation="vertical"
                size="lg"
                data={['All', ...amenityCategories]}
              />
            </ScrollArea>
            <Divider orientation="vertical" mx={16} />
            <Box w="100%">
              <Flex align="center" gap="xl" wrap="wrap">
                <TextInput
                  w={300}
                  value={filter}
                  onChange={(e) => {
                    if (filter !== '' && selectedCategory !== 'All')
                      setSelectedCategory('All')
                    setFilter(e.currentTarget.value)
                  }}
                  placeholder="Filter"
                  icon={<IconSearch size={16} />}
                />
                <Checkbox
                  label="Only show included"
                  checked={onlyIncluded}
                  onChange={() => setOnlyIncluded(!onlyIncluded)}
                  disabled={!amenities.find(({ checked }) => checked)}
                />
              </Flex>
              <ScrollArea w="100%" className={classes.tableScroll} type="auto">
                <Table w="100%">
                  <thead>
                    <tr>
                      <th>Amenity</th>
                      <th>Description (optional)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(onlyIncluded
                      ? amenities.filter(({ checked }) => checked)
                      : amenities
                    )
                      .filter(filter !== '' ? filterAmenities : categoryFilter)
                      .map(({ typeId, name, checked, note }) => (
                        <AmenityRow
                          key={typeId}
                          name={String(name)}
                          typeId={typeId}
                          checked={checked ?? false}
                          note={String(note)}
                          amenities={amenities}
                          setAmenities={setAmenities}
                          syncAmenityButtons={syncAmenityButtons}
                        />
                      ))}
                  </tbody>
                </Table>
              </ScrollArea>
            </Box>
          </Flex>
        </Stack>
        <Flex justify={'flex-end'}>
          <Button type="submit">{buttonText}</Button>
        </Flex>
      </form>
    </div>
  )
}

export default NewAmenities
