import React from 'react'
import { createStyles } from '@mantine/core'

const useStyles = createStyles(() => ({
  mailtoLink: {
    color: 'inherit',
    textDecoration: 'inherit',
  },
}))
interface Props {
  children: string
}

const ThreadHeader = ({ children }: Props) => {
  const { classes } = useStyles()

  return (
    <a
      href={`mailto:${children}`}
      className={classes.mailtoLink}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  )
}

export default ThreadHeader
