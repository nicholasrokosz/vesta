import { type NextPage } from 'next'
import {
  Center,
  Title,
  Text,
  createStyles,
  Stack,
  Button,
  Space,
  Flex,
} from '@mantine/core'
import { api } from 'utils/api'
import AutomationsTable from 'components/automations/AutomationsTable/AutomationsTable'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'

const useStyles = createStyles((theme) => ({
  header: {
    justifyContent: 'center',
  },
  text: {
    color: theme.colors.neutral[5],
    fontSize: 16,
    lineHeight: '140%',
  },
}))

const Home: NextPage = () => {
  const { classes } = useStyles()
  const automations = api.automations.getAll.useQuery()

  return (
    <>
      <Flex justify="space-between">
        <Title order={1}>Automations</Title>
        {!!automations?.data?.all.length && (
          <Button component="a" href="/automations/new">
            New template
          </Button>
        )}
      </Flex>
      <Space h="xl" />
      <VestaSpinnerOverlay visible={automations.isLoading} />
      {!automations.isLoading && (
        <>
          {automations?.data?.all.length ? (
            <AutomationsTable automations={automations.data.all} />
          ) : (
            <Center pt={100}>
              <Stack align={'center'} w={600}>
                <>
                  <Title order={2}>
                    Your automated messages library is empty
                  </Title>
                  <Text className={classes.text}>
                    Automated messages can help you to answer with dynamic data.
                    Click on the button below to get started.
                  </Text>
                </>
                <Button component="a" href="/automations/new">
                  New template
                </Button>
              </Stack>
            </Center>
          )}
        </>
      )}
    </>
  )
}

export default Home
