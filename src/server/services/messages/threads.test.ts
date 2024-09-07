import { DateTime } from 'luxon'
import {
  disableSending,
  getMostRecentMessage,
  isOverdue,
  // getMergeTags,
} from './threads'
import type { IMessage } from 'types/messages'
import type { MessageThread } from './types'
import { Channel } from '@prisma/client'

const today = new Date()
const nextDay = new Date(today)
const thirdDay = new Date(today)
nextDay.setDate(today.getDate() + 1)
thirdDay.setDate(today.getDate() + 2)
const messages: IMessage[] = [
  {
    id: '1',
    message: 'oldest message',
    user: 'GUEST',
    timestamp: today,
  },
  {
    id: '2',
    message: 'middle message',
    user: 'GUEST',
    timestamp: thirdDay,
  },
  {
    id: '3',
    message: 'most recent message',
    user: 'GUEST',
    timestamp: nextDay,
  },
]

describe('Message threads', () => {
  describe('getMostRecentMessage', () => {
    it('has most recent message', () => {
      const mostRecentMessage = getMostRecentMessage(messages)

      expect(mostRecentMessage.id).toBe('2')
    })
  })

  describe('isOverdue', () => {
    const today = DateTime.local()

    it('returns false when the last two messages are guest and the oldest time is less than an hour ago', () => {
      const messages: IMessage[] = [
        {
          id: '12346',
          message: 'Hello',
          user: 'PROPERTY_MANAGER',
          timestamp: today.minus({ hours: 2 }).toJSDate(),
        },
        {
          id: '12345',
          message: 'You need to respond to this right now',
          user: 'GUEST',
          timestamp: today.minus({ minutes: 59 }).toJSDate(),
        },
        {
          id: '12345',
          message: 'You need to respond to this right now',
          user: 'GUEST',
          timestamp: today.minus({ minutes: 32 }).toJSDate(),
        },
      ]

      const result = isOverdue(messages)

      expect(result).toBe(false)
    })

    it('returns true when the last two messages are guest and the oldest time is more than an hour ago', () => {
      const messages: IMessage[] = [
        {
          id: '12346',
          message: 'Hello',
          user: 'PROPERTY_MANAGER',
          timestamp: today.minus({ hours: 2 }).toJSDate(),
        },
        {
          id: '12345',
          message: 'You need to respond to this right now',
          user: 'GUEST',
          timestamp: today.minus({ minutes: 70 }).toJSDate(),
        },
        {
          id: '12345',
          message: 'You need to respond to this right now',
          user: 'GUEST',
          timestamp: today.minus({ minutes: 30 }).toJSDate(),
        },
      ]

      const result = isOverdue(messages)

      expect(result).toBe(true)
    })

    it('returns false when the last message was guest and the time is less than 1 hour', () => {
      const messages: IMessage[] = [
        {
          id: '12346',
          message: 'Hello',
          user: 'PROPERTY_MANAGER',
          timestamp: today.minus({ hours: 2 }).toJSDate(),
        },
        {
          id: '12345',
          message: 'You need to respond to this right now',
          user: 'GUEST',
          timestamp: today.minus({ minutes: 30 }).toJSDate(),
        },
      ]

      const result = isOverdue(messages)

      expect(result).toBe(false)
    })

    it('returns false when the last sender was property manager', () => {
      const messages: IMessage[] = [
        {
          id: '12345',
          message: 'You need to respond to this right now',
          user: 'GUEST',
          timestamp: today.minus({ hours: 3 }).toJSDate(),
        },
        {
          id: '12346',
          message: 'I responded',
          user: 'PROPERTY_MANAGER',
          timestamp: today.minus({ minutes: 30 }).toJSDate(),
        },
      ]

      const result = isOverdue(messages)

      expect(result).toBe(false)
    })

    it('returns false when there are no messages', () => {
      const messages: IMessage[] = []

      const result = isOverdue(messages)

      expect(result).toBe(false)
    })
  })

  describe('disableSending', () => {
    let thread: MessageThread

    beforeEach(() => {
      thread = {
        id: 'thread-1',
        createdAt: new Date(),
        guest: {
          id: '',
          name: '',
          email: null,
          phone: null,
        },
        listingId: '',
        listing: {
          id: '',
          name: '',
          timeZone: '',
        },
        channel: 'Airbnb',
        messages: messages,
        archived: false,
        enableReminder: true,
      }
    })

    describe(`${Channel.Direct} channels`, () => {
      beforeEach(() => {
        thread.channel = Channel.Direct
      })

      it('returns true when there is no guest email', () => {
        expect(disableSending(thread)).toBe(true)
      })

      it('returns false when there is a guest email', () => {
        thread.guest.email = 'rando@calrissian.net'
        expect(disableSending(thread)).toBe(false)
      })
    })

    it('returns false by default', () => {
      expect(disableSending(thread)).toBe(false)
    })
  })
})
