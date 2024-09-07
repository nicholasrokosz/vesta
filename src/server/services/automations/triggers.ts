import type { ReservationStatus } from '@prisma/client'
import type { ITrigger, MessageTemplateCreate } from 'types/automations'
import { Triggers } from 'types/automations'
import type {
  TriggerRangeType,
  TriggerType,
  TriggerUnitType,
} from '../../../../prisma/generated/zod'

export const getTriggerLabel = (trigger?: TriggerType) => {
  if (!trigger) return ''
  return Triggers.find((t) => t.value === trigger)?.label ?? ''
}

export const getTrigger = (messageTemplate: MessageTemplateCreate) => {
  if (!messageTemplate.trigger || !messageTemplate.triggerRange) return

  return _getTrigger(
    messageTemplate.triggerRange,
    messageTemplate.trigger,
    messageTemplate.triggerUnit,
    messageTemplate.triggerValue
  )
}

export const calculateScheduledTime = (
  checkinTime: Date,
  checkoutTime: Date,
  trigger: ITrigger,
  reservationStatus?: ReservationStatus
) => {
  const baseTime = trigger.type === 'CheckIn' ? checkinTime : checkoutTime
  const time =
    trigger.type === 'ReservationConfirmed' ? new Date() : new Date(baseTime)

  if (
    trigger.range === 'Immediately' ||
    (trigger.type === 'ReservationConfirmed' &&
      reservationStatus === 'CONFIRMED' &&
      trigger.range === 'Before')
  )
    return time

  const multiplier = trigger.range === 'Before' ? -1 : 1
  switch (trigger.unit) {
    case 'Minutes':
      time.setMinutes(time.getMinutes() + multiplier * trigger.value)
      break
    case 'Hours':
      time.setHours(time.getHours() + multiplier * trigger.value)
      break
    case 'Days':
      time.setDate(time.getDate() + multiplier * trigger.value)
      break
  }

  return time
}

export const _getTrigger = (
  range: TriggerRangeType,
  type: TriggerType,
  unit?: TriggerUnitType | null,
  value?: number | null
) => {
  if (range === 'Immediately') {
    return {
      type,
      range,
    }
  } else if (range === 'After' || range === 'Before') {
    if (!unit || !value) {
      throw new Error(
        "Unit and value are required for range 'After' or 'Before'"
      )
    }
    return {
      type,
      range,
      unit,
      value,
    }
  }
  throw new Error('Invalid range value')
}
