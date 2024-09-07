import { createStyles, Flex, Text } from '@mantine/core'
import { IconChevronRight } from '@tabler/icons-react'
import Link from 'next/link'
import { Fragment } from 'react'

const useStyles = createStyles((theme) => ({
  item: {
    marginRight: '0.5rem',
  },
  link: {
    textDecoration: 'none',
    color: theme.colors.gray[5],
    '&:hover': {
      textDecoration: 'underline',
      color: theme.colors.gray[6],
    },
  },
  separator: {
    color: theme.colors.vesta[4],
  },
}))

type Link = { title: string; href?: string }

interface BreadcrumbsProps {
  links: Link[]
}

const Breadcrumbs = ({ links }: BreadcrumbsProps) => {
  const { classes, cx } = useStyles()

  return (
    <Flex align="center">
      {links.slice(0, -1).map(({ title, href }: Link) => (
        <Fragment key={href}>
          <Link href={href ?? ''} className={cx(classes.item, classes.link)}>
            <Text fw="bold">{title}</Text>
          </Link>
          <IconChevronRight
            size={20}
            stroke={3}
            className={cx(classes.item, classes.separator)}
          />
        </Fragment>
      ))}
      <Text fw="bold">{links[links.length - 1].title}</Text>
    </Flex>
  )
}

export default Breadcrumbs
