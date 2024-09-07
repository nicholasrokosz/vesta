/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react/display-name */

import { createStyles } from '@mantine/core'
import type { Key } from 'react'
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'

const useStyles = createStyles((theme) => ({
  tagsContainer: {
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${theme.colors.gray[2]}`,
    height: 254,
    overflowY: 'scroll',
    padding: 10,
    fontSize: 14,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  tag: {
    color: '#47099D',
    border: 'none',
    backgroundColor: '#EDE2FD',
    borderRadius: 4,
    padding: '4px 8px',
    cursor: 'pointer',
    margin: 1,
  },
}))

interface Props {
  items: string[]
  command: (value: { id: string }) => void
}

export default forwardRef((props: Props, ref: React.ForwardedRef<unknown>) => {
  const { classes } = useStyles()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: Key | null | undefined) => {
    const item = props.items[(index as number) || 0]

    if (item) {
      props.command({ id: item })
    }
  }

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    )
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: { key: string } }) => {
      if ('key' in event) {
        if (event.key === 'ArrowUp') {
          upHandler()
          return true
        }

        if (event.key === 'ArrowDown') {
          downHandler()
          return true
        }

        if (event.key === 'Enter') {
          enterHandler()
          return true
        }
      }

      return false
    },
  }))

  return (
    <div className={classes.tagsContainer}>
      {props.items.length ? (
        props.items.map(
          (
            item:
              | string
              | number
              | boolean
              | React.ReactElement<
                  any,
                  string | React.JSXElementConstructor<any>
                >
              | React.ReactFragment
              | React.ReactPortal
              | null
              | undefined,
            index: React.Key | null | undefined
          ) => (
            <button
              className={classes.tag}
              key={index}
              onClick={() => selectItem(index)}
            >
              {item}
            </button>
          )
        )
      ) : (
        <div className="item">No result</div>
      )}
    </div>
  )
})
