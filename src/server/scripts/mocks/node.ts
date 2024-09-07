// Used to setup MSW, see: https://mswjs.io/docs/integrations/node
// The server must still be started by calling server.listen() after importing server defined below
import { setupServer } from 'msw/node'
import { handlers } from './handlers'
export const server = setupServer(...handlers)
