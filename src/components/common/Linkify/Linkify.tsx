import { Anchor, createStyles } from '@mantine/core'
import { v4 as uuidv4 } from 'uuid'

const useStyles = createStyles((theme) => ({
  guest: {
    backgroundColor: theme.colors.gray[2],
  },
  propertyManager: {
    color: 'white',
    backgroundColor: theme.colors.vesta[3],
  },
  link: {
    wordBreak: 'break-all',
  },
}))

const Linkify = ({ children }: { children: string }) => {
  const { classes } = useStyles()

  const URL_REGEX =
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm

  return (
    <>
      {children.split(' ').map((word) =>
        word.match(URL_REGEX) ? (
          <Anchor
            key={uuidv4()}
            href={word}
            target="_blank"
            className={classes.link}
          >
            {word}
          </Anchor>
        ) : (
          ` ${word} `
        )
      )}
    </>
  )
}

export default Linkify
