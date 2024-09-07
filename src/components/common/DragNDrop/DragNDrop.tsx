import React, { useEffect, useState } from 'react'
import { createStyles, BackgroundImage, Flex, Button } from '@mantine/core'
import { useListState } from '@mantine/hooks'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import vestaPhotoUtil from 'utils/vestaPhoto'
import { v4 as uuidv4 } from 'uuid'

const useStyles = createStyles((theme) => ({
  droppableArea: {
    overflow: 'scroll',
    margin: '0 1rem',
    cursor: 'all-scroll',
  },
  closeButton: {
    backgroundColor: theme.colors.vesta[1],
    color: theme.colors.vesta[5],
    border: 1,
    margin: 10,
  },
  preview: {
    height: 161,
    width: 214,
    marginRight: '1rem',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
  },
  previewWrapper: {
    marginBottom: '1rem',
  },
}))

interface DndListProps {
  photos: string[]
  setPhotos: (photos: string[]) => void
}

export function DndList({ photos, setPhotos }: DndListProps) {
  const { classes } = useStyles()
  const [initialized, setIntialized] = useState<boolean>(false)
  const [state, handlers] = useListState<string>([])

  useEffect(() => {
    if (photos && photos.length > 0 && !initialized) {
      setIntialized(true)
      handlers.setState(photos)
    }
  }, [photos])

  useEffect(() => {
    setPhotos([...state])
  }, [state, setPhotos])

  const removePhoto = (photo: string) => {
    const newPhotos = [...photos]
    const index = newPhotos.indexOf(photo)
    if (index > -1) {
      newPhotos.splice(index, 1)
    }
    setPhotos(newPhotos)
  }

  const items = state.map((item, index) => (
    <Draggable key={uuidv4()} index={index} draggableId={item}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className={classes.previewWrapper}
        >
          <BackgroundImage
            className={classes.preview}
            key={uuidv4()}
            src={vestaPhotoUtil.getMedium(item)}
          >
            <Flex justify="flex-end" align="center">
              <Button
                className={classes.closeButton}
                onClick={() => {
                  removePhoto(item)
                  handlers.remove(index)
                }}
              >
                X
              </Button>
            </Flex>
          </BackgroundImage>
        </div>
      )}
    </Draggable>
  ))

  return (
    <DragDropContext
      onDragEnd={({ destination, source }) => {
        handlers.reorder({ from: source.index, to: destination?.index || 0 })
      }}
    >
      <Droppable droppableId="dnd-list" direction="horizontal">
        {(provided) => (
          <Flex
            className={classes.droppableArea}
            w="100%"
            direction="row"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {items}
            {provided.placeholder}
          </Flex>
        )}
      </Droppable>
    </DragDropContext>
  )
}
export default DndList
