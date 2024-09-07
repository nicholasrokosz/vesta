import { checkMessageGap } from './messages'
import { DateTime } from 'luxon'
import type { IMessage } from 'types/messages'

describe('Messages', () => {
  describe('checkMessageGap', () => {
    it('it should return true if two messages are more than an hour apart', () => {
      const message1: IMessage = {
        id: '',
        message: '',
        user: 'GUEST',
        timestamp: DateTime.fromObject({ hour: 10 }).toJSDate(),
      }
      const message2: IMessage = {
        id: '',
        message: '',
        user: 'GUEST',
        timestamp: DateTime.fromObject({ hour: 11 }).toJSDate(),
      }

      expect(checkMessageGap(message1, message2)).toEqual(true)
    })
    it('it should return false if two messages are less than an hour apart', () => {
      const message1: IMessage = {
        id: '',
        message: '',
        user: 'GUEST',
        timestamp: DateTime.fromObject({ hour: 10 }).toJSDate(),
      }
      const message2: IMessage = {
        id: '',
        message: '',
        user: 'GUEST',
        timestamp: DateTime.fromObject({
          hour: 10,
          minute: 59,
          second: 59,
        }).toJSDate(),
      }

      expect(checkMessageGap(message1, message2)).toEqual(false)
    })
  })
})
