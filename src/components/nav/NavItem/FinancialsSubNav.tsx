import { createStyles, Flex, NavLink } from '@mantine/core'

import Link from 'next/link'
import NavIcon from './NavIcon'
import type { FinancialsSubsection } from '../types'
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

const FinancialsSubNav = () => {
  const { classes, cx } = useStyles()
  const router = useRouter()

  const subSection = router.route.split('/')[2] as FinancialsSubsection

  return (
    <>
      <Link href={`/financials/revenue`} style={{ textDecoration: 'none' }}>
        <Flex justify="flex-end">
          <NavLink
            label="Revenue"
            icon={<NavIcon section="all" />}
            className={cx(classes.navItem, classes.subNavItem, {
              [classes.active]: subSection === 'revenue',
            })}
            variant="filled"
          />
        </Flex>
      </Link>
      <Link
        href={`/financials/ownerstatements`}
        style={{ textDecoration: 'none' }}
      >
        <Flex justify="flex-end">
          <NavLink
            label="Owner Statements"
            icon={<NavIcon section="ownerstatements" />}
            className={cx(classes.navItem, classes.subNavItem, {
              [classes.active]: subSection === 'ownerstatements',
            })}
            variant="filled"
          />
        </Flex>
      </Link>
      <Link href={`/financials/expenses`} style={{ textDecoration: 'none' }}>
        <Flex justify="flex-end">
          <NavLink
            label="Expenses"
            icon={<NavIcon section="expenses" />}
            className={cx(classes.navItem, classes.subNavItem, {
              [classes.active]: subSection === 'expenses',
            })}
            variant="filled"
          />
        </Flex>
      </Link>
    </>
  )
}

export default FinancialsSubNav
