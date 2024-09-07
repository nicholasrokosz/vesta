import {
  IconHome,
  IconMessage,
  IconCalendarEvent,
  IconRepeat,
  IconInbox,
  IconMailbox,
  IconMessage2Exclamation,
  IconPigMoney,
  IconCurrencyDollar,
  IconReceipt2,
  IconBusinessplan,
  IconSettings,
  IconArchive,
} from '@tabler/icons-react'
import type {
  FinancialsSubsection,
  MessagesSubsection,
  Section,
} from '../types'

interface Props {
  section: Section | MessagesSubsection | FinancialsSubsection
}

const NavIcon = ({ section }: Props) => {
  const IconComponent = iconMapping[section]
  return IconComponent ? <IconComponent /> : null
}

const iconMapping = {
  messages: IconMessage,
  listings: IconHome,
  calendar: IconCalendarEvent,
  automations: IconRepeat,
  all: IconInbox,
  unread: IconMailbox,
  overdue: IconMessage2Exclamation,
  archived: IconArchive,
  financials: IconCurrencyDollar,
  revenue: IconPigMoney,
  ownerstatements: IconReceipt2,
  expenses: IconBusinessplan,
  admin: IconSettings,
  ownerCalendar: IconCalendarEvent,
  ownerFinancials: IconReceipt2,
}

export default NavIcon
