/* eslint-disable react/display-name */
import React, { forwardRef } from 'react'
import { Group, Avatar, Text } from '@mantine/core'
import { IconHome } from '@tabler/icons-react'

export interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string
  label: string
  description: string
}

export const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, description, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={image} radius="xl">
          <IconHome />
        </Avatar>
        <div>
          <Text size="sm">{label}</Text>
          <Text size="xs" opacity={0.65}>
            {description}
          </Text>
        </div>
      </Group>
    </div>
  )
)
