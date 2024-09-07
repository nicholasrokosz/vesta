import { Flex, Title, Space, Center, Stack } from '@mantine/core'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import type { NextPage } from 'next'
import { api } from 'utils/api'
import OwnerStatementsTable from 'components/ownerstatement/OwnerStatementsTable/OwnerStatementsTable'

const OwnerStatements: NextPage = () => {
  const { data, isLoading } = api.owner.getStatements.useQuery()

  const filteredOwnerStatements = data?.filter(
    (owner) => owner.listings.length > 0
  )

  return (
    <>
      <Flex justify="space-between">
        <Title order={1}>Statements</Title>
      </Flex>
      <Space h="xl" />
      <VestaSpinnerOverlay visible={isLoading} />
      {!isLoading && (
        <Stack>
          {filteredOwnerStatements?.length ? (
            <OwnerStatementsTable
              owners={filteredOwnerStatements}
              ownerPortal={true}
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
