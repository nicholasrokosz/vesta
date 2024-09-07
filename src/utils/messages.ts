import { DateTime } from 'luxon'
import type { IMessage } from 'types/messages'

export const checkMessageGap = (message1: IMessage, message2: IMessage) => {
  const timeDifference =
    DateTime.fromJSDate(message1.timestamp)
      .diff(DateTime.fromJSDate(message2.timestamp), 'hours')
      .toObject().hours ?? 0

  return Math.abs(timeDifference) >= 1
}
