/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable import/no-anonymous-default-export */

import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import TagList from './TagList'

export default {
  items: ({ query }) => {
    return [
      '{{guest_name}}',
      '{{guest_full_name}}',
      '{{total_num_guests}}',
      '{{num_adults}}',
      '{{num_children}}',
      '{{channel_name}}',
      '{{check_in_time}}',
      '{{check_out_time}}',
      '{{listing_title}}',
      '{{listing_address}}',
      '{{listing_city}}',
      '{{listing_num_beds}}',
      '{{listing_num_baths}}',
      '{{listing_unit_type}}',
      '{{listing_wifi_name}}',
      '{{listing_wifi_password}}',
      '{{listing_door_code}}',
      '{{listing_url}}',
      '{{cleaning_fee}}',
      '{{property_manager_name}}',
      '{{property_manager_full_name}}',
      '{{property_manager_email}}',
      '{{property_manager_phone}}',
    ].filter((item) => item.toLowerCase().startsWith(query.toLowerCase()))
  },

  render: () => {
    let component
    let popup

    return {
      onStart: (props) => {
        component = new ReactRenderer(TagList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },

      onUpdate(props) {
        if (!props) {
          return
        }

        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup[0].hide()

          return true
        }

        return component.ref?.onKeyDown(props)
      },

      onExit() {
        popup[0].destroy()
        component.destroy()
      },
    }
  },
}
