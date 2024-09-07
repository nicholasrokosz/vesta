import { Twilio } from 'twilio'

class TwilioService {
  protected readonly client: Twilio
  protected readonly twilioPhoneNumber: string

  public constructor(
    accountSid = process.env.TWILIO_ACCOUNT_SID,
    authToken = process.env.TWILIO_AUTH_TOKEN,
    twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER
  ) {
    this.client = new Twilio(accountSid, authToken)
    this.twilioPhoneNumber = twilioPhoneNumber || ''
  }

  public async sendSMS(phoneNumber: string, message: string) {
    return await this.client.messages.create({
      from: this.twilioPhoneNumber,
      to: phoneNumber,
      body: message,
    })
  }
}

export default TwilioService
