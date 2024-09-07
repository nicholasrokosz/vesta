import { type AppType } from 'next/app'
import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { useRouter } from 'next/router'
import Head from 'next/head'

import '../styles/global.css'
import '@mobiscroll/react/dist/css/mobiscroll.min.css'
import './calendar/calendar.css'
import 'react-phone-number-input/style.css'
import './phone-input.css'

import { api } from '../utils/api'
import { theme } from 'components/theme'
import Nav from 'components/nav/Nav/Nav'
import { titleCase } from 'utils/vesta'
import VestaSpotlightProvider from 'components/common/VestaSpotlightProvider/VestaSpotlightProvider'

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter()
  const pageTitle =
    router.route === '/' || router.route === '/en'
      ? 'Vesta'
      : `${titleCase(router.route.split('/')[1])} : Vesta`
  const isDirect = router.route.startsWith('/direct')

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
        <SessionProvider session={session}>
          <Notifications position="top-right" />
          {!isDirect ? (
            <VestaSpotlightProvider>
              <Nav>
                <Component {...pageProps} />
              </Nav>
            </VestaSpotlightProvider>
          ) : (
            <Component {...pageProps} />
          )}
        </SessionProvider>
      </MantineProvider>
    </>
  )
}

export default api.withTRPC(MyApp)
