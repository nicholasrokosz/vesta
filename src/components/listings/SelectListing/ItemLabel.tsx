/* eslint-disable react/display-name */
import React, { forwardRef } from 'react'
import { Group, Avatar, Text, CloseButton } from '@mantine/core'

export interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string
  label: string
  description: string
  onRemove: () => void
}

export const MultiSelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, description, onRemove, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={image} radius="xl" />
        <div>
          <Text size="sm">{label}</Text>
          <Text size="xs" opacity={0.65}>
            {description}
          </Text>
        </div>
        <CloseButton
          onMouseDown={onRemove}
          variant="transparent"
          size={22}
          iconSize={14}
          tabIndex={-1}
        />
      </Group>
    </div>
  )
)
