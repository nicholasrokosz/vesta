import type { Organization, PrismaClient, User } from '@prisma/client'
import { GlobalRole, OrganizationRole } from '@prisma/client'
import { prisma } from 'server/db'
import BookingPalSupplierApi from 'server/integrations/bookingpal/supplier'
import { mapOwnerToCompany } from './mapping'
import type { Company } from 'server/integrations/bookingpal/types'
import type { UserCreate } from 'types/users'
import { cleanPhone } from '../guest/utils'
import Auth0Service from 'server/integrations/auth0'

class UserService {
  constructor(
    private readonly prismaUser: PrismaClient['user'],
    private readonly prismaAccount: PrismaClient['account'],
    private readonly organizationId: string
  ) {}

  async getPropertyManagers() {
    const users = await this.prismaUser.findMany({
      where: {
        organizationId: this.organizationId,
        organizationRole: {
          in: [OrganizationRole.ADMIN, OrganizationRole.PROPERTY_MANAGER],
        },
      },
      select: { id: true, name: true },
    })

    return users
  }

  async getPropertyOwners(organizationId: string) {
    const users = await this.prismaUser.findMany({
      where: {
        organizationId: organizationId,
        organizationRole: OrganizationRole.PROPERTY_OWNER,
      },
      select: { id: true, name: true },
    })

    return users
  }

  async getRole(userId: string) {
    const user = await this.prismaUser.findUnique({
      where: {
        id: userId,
      },
      select: { globalRole: true },
    })

    return user
  }

  async getOne(userId: string) {
    return await this.prismaUser.findUnique({
      where: {
        id: userId,
      },
      include: {
        organization: true,
        bookingPalConnection: true,
      },
    })
  }

  async publishOwner(user: User, organization: Organization) {
    const supplierApi = new BookingPalSupplierApi()

    const company: Company = mapOwnerToCompany(user, organization)
    let bpConnection = await prisma.bookingPalConnection.findUnique({
      where: {
        ownerId: user.id,
      },
    })

    const token = await supplierApi.getToken()

    if (bpConnection) {
      await supplierApi.updatePropertyManager(
        token,
        bpConnection.companyId,
        company
      )
    } else {
      bpConnection = await supplierApi
        .createPropertyManager(token, company)
        .then(async (company) => {
          return await prisma.bookingPalConnection.create({
            data: {
              companyId: company.id,
              email: company.companyDetails.email,
              password: company.companyDetails.password,
              ownerId: user.id,
            },
          })
        })
    }

    return bpConnection
  }

  async getAllCustomersInOrg() {
    const customers = await this.prismaUser.findMany({
      where: {
        organizationId: this.organizationId,
        globalRole: GlobalRole.CUSTOMER,
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        accounts: true,
      },
    })

    return customers.map((c) => {
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        organizationRole: c.organizationRole,
        hasLogin: c.accounts.some(
          (a) => a.type === 'oauth' && a.provider === 'auth0'
        ),
      }
    })
  }

  async createUser(user: UserCreate) {
    if (user.organizationRole === OrganizationRole.PROPERTY_MANAGER) {
      await this.createPropertyManager(user)
    } else if (user.organizationRole === OrganizationRole.PROPERTY_OWNER) {
      await this.createPropertyOwner(user)
    } else {
      throw new Error('Invalid organization role')
    }
  }

  async createPropertyOwner(user: UserCreate) {
    await prisma.user.create({
      data: {
        ...user,
        phone: cleanPhone(user.phone),
        organizationId: this.organizationId,
      },
    })
  }

  async createPropertyManager(user: UserCreate) {
    const auth0Service = new Auth0Service()
    const auth0User = await auth0Service.createAuth0User({
      name: user.name || '',
      email: user.email || '',
    })

    if (auth0User && auth0User.user_id) {
      const newUser = await prisma.user.create({
        data: {
          ...user,
          phone: cleanPhone(user.phone),
          organizationId: this.organizationId,
        },
      })

      await this.prismaAccount.create({
        data: {
          userId: newUser.id,
          type: 'oauth',
          provider: 'auth0',
          providerAccountId: auth0User.user_id,
        },
      })
    }
  }

  async createUserLogin(id: string) {
    const user = await this.prismaUser.findUnique({
      where: {
        id,
      },
      include: {
        accounts: true,
      },
    })

    if (!user) return
    if (user.accounts.some((a) => a.type === 'oauth' && a.provider === 'auth0'))
      return

    const auth0Service = new Auth0Service()
    const auth0User = await auth0Service.createAuth0User({
      name: user.name || '',
      email: user.email || '',
    })

    if (auth0User && auth0User.user_id) {
      await this.prismaAccount.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'auth0',
          providerAccountId: auth0User.user_id,
        },
      })
    }
  }
}

export default UserService
