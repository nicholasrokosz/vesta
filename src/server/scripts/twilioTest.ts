import TwilioService from 'server/integrations/twilio'
import { captureErrorsInSentry } from 'utils/sentry'

async function sendMessage(phoneNumber: string, message: string) {
  const twilioService = new TwilioService()

  const response = await twilioService.sendSMS(phoneNumber, message)

  return response
}

const phoneNumber = process.argv[2]
console.log(`Sending SMS to ${phoneNumber}`)

captureErrorsInSentry(sendMessage(phoneNumber, 'Hello from Vesta!'))
  .then((response) => {
    console.log(`Message sent ${response.sid}: ${response.status}`)
  })
  .catch((e) => {
    const error = e as Error
    console.log(`Error sending message ${error.message}`)
  })
