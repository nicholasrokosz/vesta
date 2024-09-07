import { createStyles, NavLink } from '@mantine/core'

import Link from 'next/link'
import NavIcon from './NavIcon'
import type { Section } from '../types'
import { sectionMapping } from '../types'
import MessagesSubNav from './MessagesSubNav'
import FinancialsSubNav from './FinancialsSubNav'

const useStyles = createStyles((theme) => ({
  navItem: {
    borderRadius: 8,
    '&:hover': {
      backgroundColor: theme.colors.vesta[4],
      color: 'white',
    },
  },
  active: {
    backgroundColor: '#D1CCD9',
  },
}))

interface Props {
  section: Section
  route: string
}

const NavItem = ({ section, route }: Props) => {
  const { classes } = useStyles()
  const sectionData = sectionMapping[section]

  const getIsActive = () => {
    if (sectionData.name === 'Messages') {
      return route.includes('threadState')
    }
    if (sectionData.name === 'Financials') {
      return route.includes('/financials/')
    }
    return route.startsWith(sectionData.link)
  }
  const isActive = getIsActive()

  return (
    <>
      <Link
        href={sectionData.link}
        style={{
          textDecoration: 'none',
        }}
      >
        <NavLink
          label={sectionData.name}
          color={'vesta'}
          icon={<NavIcon section={section} />}
          className={classes.navItem}
          variant="filled"
          active={isActive}
        />
      </Link>
      {sectionData.name === 'Messages' && isActive && <MessagesSubNav />}
      {sectionData.name === 'Financials' && isActive && <FinancialsSubNav />}
    </>
  )
}

export default NavItem
