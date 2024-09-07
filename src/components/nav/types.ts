export type Section =
  | 'messages'
  | 'listings'
  | 'calendar'
  | 'automations'
  | 'financials'
  | 'admin'
  | 'ownerCalendar'
  | 'ownerFinancials'

const messagesSubsections = ['all', 'unread', 'overdue', 'archived'] as const
export type MessagesSubsection = (typeof messagesSubsections)[number]

const financialsSubsections = [
  'revenue',
  'ownerstatements',
  'expenses',
] as const
export type FinancialsSubsection = (typeof financialsSubsections)[number]

export const sectionMapping = {
  calendar: {
    name: 'Calendar',
    link: '/calendar',
  },
  messages: {
    name: 'Messages',
    link: '/messages/all',
  },
  automations: {
    name: 'Automations',
    link: '/automations',
  },
  listings: {
    name: 'Listings',
    link: '/listings',
  },
  financials: {
    name: 'Financials',
    link: '/financials/revenue',
  },
  admin: {
    name: 'Admin',
    link: '/admin',
  },
  ownerCalendar: {
    name: 'Calendar',
    link: '/owner/calendar',
  },
  ownerFinancials: {
    name: 'Statements',
    link: '/owner/statements',
  },
}
