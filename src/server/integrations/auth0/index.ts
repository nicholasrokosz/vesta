import type { ResetPasswordEmailOptions } from 'auth0'
import Auth0 from 'auth0'
import generator from 'generate-password'
import { captureErrorsInSentry } from 'utils/sentry'

class Auth0Service {
  protected readonly webClientId: string
  protected readonly clientId: string
  protected readonly clientSecret: string
  protected readonly domain: string
  protected readonly audience: string
  protected readonly connectionName = 'Username-Password-Authentication'

  public constructor(
    webClientId = process.env.AUTH0_ID,
    clientId = process.env.AUTH0_MANAGEMENT_API_ID,
    clientSecret = process.env.AUTH0_MANAGEMENT_API_SECRET,
    domain = process.env.AUTH0_MANAGEMENT_API_DOMAIN
  ) {
    this.webClientId = webClientId || ''
    this.clientId = clientId || ''
    this.clientSecret = clientSecret || ''
    this.domain = domain || ''
    this.audience = `https://${this.domain}/api/v2/`
  }

  public async createAuth0User(user: { name: string; email: string }) {
    const auth0User = await this.createUser(user)
    await this.sendPasswordResetEmail(user.email)
    return auth0User
  }

  private generatePassword() {
    return generator.generate({
      length: 8,
      numbers: true,
      symbols: true,
      uppercase: true,
      strict: true,
    })
  }

  private async createUser(user: { name: string; email: string }) {
    const managementClient = new Auth0.ManagementClient({
      domain: this.domain,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      scope: 'create:users',
      audience: this.audience,
      tokenProvider: {
        enableCache: true,
        cacheTTLInSeconds: 10,
      },
    })

    return captureErrorsInSentry(
      managementClient.createUser({
        connection: this.connectionName,
        email: user.email || '',
        password: this.generatePassword(),
        email_verified: false,
        verify_email: true,
        app_metadata: {},
      })
    ).catch((e) => {
      console.log('Error creating user in Auth0:', e)
      throw e
    })
  }

  private async sendPasswordResetEmail(email: string) {
    const authClient = new Auth0.AuthenticationClient({
      domain: this.domain,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
    })

    return captureErrorsInSentry(
      authClient.requestChangePasswordEmail({
        client_id: this.webClientId,
        connection: this.connectionName,
        email: email,
      } as ResetPasswordEmailOptions)
    ).catch((e) => {
      console.log('Error sending password reset email in Auth0:', e)
    })
  }
}

export default Auth0Service
