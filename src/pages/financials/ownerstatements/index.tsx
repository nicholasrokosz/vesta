import { useState } from 'react'
import { Flex, Title, Space, Center, Stack, Group } from '@mantine/core'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import type { NextPage } from 'next'
import { api } from 'utils/api'
import OwnerStatementsTable from 'components/ownerstatement/OwnerStatementsTable/OwnerStatementsTable'
import SelectListing from 'components/listings/SelectListing/Single'

const OwnerStatements: NextPage = () => {
  const { data, isLoading } = api.ownerStatements.getAllForOrg.useQuery()

  const [selectedListing, setSelectedListing] = useState<string>('')

  const filteredOwnerStatements = data
    ?.map((owner) => {
      if (selectedListing === '') {
        return owner
      } else {
        return {
          ...owner,
          listings: owner.listings.filter(
            (listing) => listing.id === selectedListing
          ),
        }
      }
    })
    .filter((owner) => owner.listings.length > 0)

  return (
    <>
      <Flex justify="space-between">
        <Title order={1}>Owner statements</Title>
      </Flex>
      <Space h="xl" />
      <VestaSpinnerOverlay visible={isLoading} />
      {!isLoading && (
        <Stack>
          <Group>
            <SelectListing
              excludeIds={[]}
              onSelect={setSelectedListing}
              selectedId={selectedListing}
              displayLabel={false}
              placeholder={'All listings'}
              allOption={true}
            />
          </Group>
          {filteredOwnerStatements?.length ? (
            <OwnerStatementsTable
              owners={filteredOwnerStatements}
              ownerPortal={false}
            />
          ) : (
            <Center pt={100}>
              <Stack align={'center'} w={600}>
                <Title order={2}>There are no statements to display</Title>
              </Stack>{' '}
            </Center>
          )}
        </Stack>
      )}
    </>
  )
}

export default OwnerStatements
