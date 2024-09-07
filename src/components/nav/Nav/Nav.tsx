import {
  createStyles,
  AppShell,
  Button,
  Navbar,
  Image,
  Stack,
  Group,
  Header,
  MediaQuery,
  Burger,
  Flex,
  Menu,
  Center,
  Box,
  Text,
} from '@mantine/core'
import type { Section } from '../types'
import NavItem from 'components/nav/NavItem/NavItem'
import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import NavUserInfo from '../NavUserInfo/NavUserInfo'
import { useIsPrintable, useHideNav } from 'utils/hooks'
import Link from 'next/link'
import { useRouter } from 'next/router'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import * as Sentry from '@sentry/nextjs'

const useStyles = createStyles((theme) => ({
  nav: {
    backgroundImage: 'url(/background.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  printable: {
    maxWidth: 1300,
    margin: `${theme.spacing.xl} auto`,
    zoom: '85%',
  },
}))

interface NavProps {
  children: ReactNode
}

const Nav = ({ children }: NavProps) => {
  const { classes } = useStyles()
  const router = useRouter()
  const isPrintable = useIsPrintable()
  const hideNav = useHideNav()
  const { data: session } = useSession({
    required: true,
    onUnauthenticated: () => void signIn('auth0'),
  })

  const role = session?.user?.orgRole
  const sections: Section[] =
    role === 'PROPERTY_OWNER'
      ? ['ownerCalendar', 'ownerFinancials']
      : [
          'calendar',
          'messages',
          'automations',
          'listings',
          'financials',
          'admin',
        ]
  const indexRoute =
    role === 'PROPERTY_OWNER' ? '/owner/calendar' : '/dashboard'

  useEffect(() => {
    if (!role || !router.route) return
    if (router.route === '/') {
      void router.push(indexRoute)
    }
  }, [router, role])

  const [opened, setOpened] = useState(false)
  const userName = session?.user.name ?? ''

  if (!!session) {
    const user = session.user
    if (!!user.email) {
      Sentry.setUser({ email: user.email })
    }
  }

  const handleLogout = () => {
    void router.replace('/')
    const client = Sentry.getCurrentHub().getClient()
    const replay = client?.getIntegration(Sentry.Replay)

    replay?.stop().finally(() => {
      void signOut({ redirect: false })
    })
  }

  if (isPrintable) return <Box className={classes.printable}>{children}</Box>
  if (hideNav) return <>{children}</>

  return (
    <>
      <VestaSpinnerOverlay visible={!role} overlayOpacity={1} />
      {role && (
        <AppShell
          padding="lg"
          navbarOffsetBreakpoint="md"
          navbar={
            <Navbar
              hiddenBreakpoint="md"
              hidden={true}
              className={classes.nav}
              width={{ base: 224 }}
              p="xs"
              pl={19}
            >
              <Navbar.Section pb={34} pt={19}>
                <Group position="center">
                  <Link
                    href={indexRoute}
                    style={{
                      textDecoration: 'none',
                    }}
                  >
                    <Image
                      width={100}
                      height={26}
                      src="/logo.png"
                      alt="Vesta"
                    />
                  </Link>
                </Group>
              </Navbar.Section>
              <Navbar.Section grow>
                <Stack spacing="lg">
                  {sections.map((section) => (
                    <NavItem
                      section={section}
                      route={router.route}
                      key={section}
                    />
                  ))}
                  <Button
                    w="80%"
                    variant="gradient"
                    gradient={{ from: 'grape', to: 'violet' }}
                    size="md"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                  <Text>
                    Reach out to{' '}
                    <Link href={'mailto:help@getvesta.io'}>
                      help@getvesta.io
                    </Link>{' '}
                    for support
                  </Text>
                </Stack>
              </Navbar.Section>

              <Navbar.Section maw={250}>
                <NavUserInfo name={userName} />
              </Navbar.Section>
            </Navbar>
          }
          header={
            <MediaQuery largerThan="md" styles={{ display: 'none' }}>
              <Header height={{ base: 60, md: 0 }} p="md">
                <Flex gap={16}>
                  <Menu
                    opened={opened}
                    onChange={setOpened}
                    width={200}
                    offset={25}
                    shadow="md"
                    closeOnItemClick={true}
                    onClose={() => setOpened(false)}
                  >
                    <Menu.Target>
                      <Burger
                        size="sm"
                        opened={opened}
                        onClick={() => setOpened((o) => !o)}
                      />
                    </Menu.Target>
                    <Menu.Dropdown
                      ml={8}
                      py={12}
                      onClick={() => setOpened(false)}
                    >
                      <Stack spacing="lg">
                        {sections.map((section) => (
                          <NavItem
                            section={section}
                            route={router.route}
                            key={section}
                          />
                        ))}
                        <Center>
                          <Button
                            w="80%"
                            variant="gradient"
                            gradient={{ from: 'grape', to: 'violet' }}
                            size="md"
                            onClick={handleLogout}
                          >
                            Logout
                          </Button>
                        </Center>
                      </Stack>
                    </Menu.Dropdown>
                  </Menu>
                  <Image width={100} height={26} src="/logo.png" alt="Vesta" />
                </Flex>
              </Header>
            </MediaQuery>
          }
        >
          {children}
        </AppShell>
      )}
    </>
  )
}

export default Nav
