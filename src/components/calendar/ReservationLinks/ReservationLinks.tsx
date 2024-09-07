import { Group, createStyles } from '@mantine/core'
import { IconCurrencyDollar, IconMessage } from '@tabler/icons-react'
import Link from 'next/link'
import React from 'react'

const useStyles = createStyles((theme) => ({
  link: {
    '&:hover': {
      cursor: 'pointer',
    },
    textDecoration: 'none',
    color: theme.colors.gray[8],
  },
  disabled: {
    '&:hover': {
      cursor: 'not-allowed',
    },
    color: theme.colors.gray[6],
  },
}))

interface ReservationLinksProps {
  messageThreadId: string | undefined
  reservationId: string
  disableFinancials: boolean
}

const ReservationLinks = ({
  messageThreadId,
  reservationId,
  disableFinancials,
}: ReservationLinksProps) => {
  const { classes } = useStyles()
  const messagesUrl = `/messages/all/${messageThreadId || ''}`
  const financialsUrl = `/financials/revenue/${reservationId}`

  return (
    <>
      <Group position="center">
        {messageThreadId ? (
          <Link href={messagesUrl} className={classes.link}>
            <Group align="center" spacing="xs">
              <IconMessage size={'1rem'} />
              Messages
            </Group>
          </Link>
        ) : (
          <Group align="center" spacing="xs" className={classes.disabled}>
            <IconCurrencyDollar size={'1rem'} />
            Messages
          </Group>
        )}
        |
        {disableFinancials ? (
          <Group align="center" spacing="xs" className={classes.disabled}>
            <IconCurrencyDollar size={'1rem'} />
            Financials
          </Group>
        ) : (
          <Link href={financialsUrl} className={classes.link}>
            <Group align="center" spacing="xs">
              <IconCurrencyDollar size={'1rem'} />
              Financials
            </Group>
          </Link>
        )}
      </Group>
    </>
  )
}

export default ReservationLinks
