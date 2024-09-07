import { createStyles, Flex, NavLink, Indicator } from '@mantine/core'

import Link from 'next/link'
import { api } from 'utils/api'
import { useEffect, useState } from 'react'
import NavIcon from './NavIcon'
import type { MessagesSubsection } from '../types'
import { useRouter } from 'next/router'

const useStyles = createStyles((theme) => ({
  navItem: {
    borderRadius: 8,
    '&:hover': {
      backgroundColor: theme.colors.vesta[4],
      color: 'white',
    },
  },
  subNavItem: {
    width: '80%',
    '&:hover': {
      backgroundColor: '#D1CCD9',
      color: 'black',
    },
  },
  active: {
    backgroundColor: '#D1CCD9',
  },
}))

const MessagesSubNav = () => {
  const { classes, cx } = useStyles()
  const router = useRouter()

  const subSection = router.query.threadState as MessagesSubsection

  const { data, status } = api.messages.getUnreadOverdue.useQuery()
  const [unreadOverdue, setUnreadOverdue] = useState({
    unread: 0,
    overdue: 0,
  })

  useEffect(() => {
    if (status !== 'success') return
    setUnreadOverdue(data)
  }, [status, data])

  if (status !== 'success') return <></>

  return (
    <>
      <Link href={`/messages/all`} style={{ textDecoration: 'none' }}>
        <Flex justify="flex-end">
          <NavLink
            label="All"
            icon={<NavIcon section="all" />}
            className={cx(classes.navItem, classes.subNavItem, {
              [classes.active]: subSection === 'all',
            })}
            variant="filled"
          />
        </Flex>
      </Link>
      <Link href={`/messages/unread`} style={{ textDecoration: 'none' }}>
        <Indicator
          position="middle-end"
          offset={16}
          label={unreadOverdue?.unread}
          disabled={unreadOverdue?.unread === 0}
          radius="xl"
          size={16}
        >
          <Flex justify="flex-end">
            <NavLink
              label="Unread"
              icon={<NavIcon section="unread" />}
              className={cx(classes.navItem, classes.subNavItem, {
                [classes.active]: subSection === 'unread',
              })}
              variant="filled"
            />
          </Flex>
        </Indicator>
      </Link>
      <Link href={`/messages/overdue`} style={{ textDecoration: 'none' }}>
        <Indicator
          position="middle-end"
          offset={16}
          label={unreadOverdue?.overdue}
          disabled={unreadOverdue?.overdue === 0}
          radius="xl"
          size={16}
        >
          <Flex justify="flex-end">
            <NavLink
              label="Overdue"
              icon={<NavIcon section="overdue" />}
              className={cx(classes.navItem, classes.subNavItem, {
                [classes.active]: subSection === 'overdue',
              })}
              variant="filled"
            />
          </Flex>
        </Indicator>
      </Link>
      <Link href={`/messages/archived`} style={{ textDecoration: 'none' }}>
        <Flex justify="flex-end">
          <NavLink
            label="Archived"
            icon={<NavIcon section="archived" />}
            className={cx(classes.navItem, classes.subNavItem, {
              [classes.active]: subSection === 'archived',
            })}
            variant="filled"
          />
        </Flex>
      </Link>
    </>
  )
}

export default MessagesSubNav
