import type { Organization } from '@prisma/client'
import { prisma } from 'server/db'
import BookingPalSupplierApi from 'server/integrations/bookingpal/supplier'
import { mapOrganizationToCompany } from './mapping'
import type { Company } from 'server/integrations/bookingpal/types'
import WizardClient from 'server/integrations/bookingpal/wizard'

class OrganizationsService {
  async getAll() {
    const organizations = await prisma.organization.findMany({
      orderBy: { name: 'asc' },
      include: {
        bookingPalConnection: true,
      },
    })

    return organizations
  }

  async getOne(organizationId: string) {
    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
      include: {
        users: true,
        bookingPalConnection: true,
      },
    })

    return organization
  }

  async getOwners(organizationId: string) {
    const owners = await prisma.user.findMany({
      where: {
        organizationId,
        organizationRole: 'PROPERTY_OWNER',
      },
      orderBy: {
        name: 'asc',
      },
    })

    return owners
  }

  async getDirectBookingStatus(organizationId: string) {
    const { directBooking: directBookingStatus } =
      await prisma.organization.findUniqueOrThrow({
        where: { id: organizationId },
        select: { directBooking: true },
      })

    return directBookingStatus
  }

  async enableDirectBooking(organizationId: string) {
    const listings = await prisma.listing.findMany({
      where: { organizationId },
    })

    for (const listing of listings) {
      await prisma.listingKey.create({
        data: { listingId: listing.id, keyType: 'Direct' },
      })
    }

    return await prisma.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        directBooking: true,
      },
    })
  }

  async publishOrganziation(organization: Organization) {
    const supplierApi = new BookingPalSupplierApi()
    const company: Company = mapOrganizationToCompany(organization)
    let bpConnection = await prisma.bookingPalConnection.findUnique({
      where: {
        organizationId: organization.id,
      },
    })

    const token = await supplierApi.getToken()

    if (bpConnection) {
      throw new Error('Organization already connected to BookingPal.')
    } else {
      bpConnection = await supplierApi
        .createPropertyManager(token, company)
        .then(async (company) => {
          return await prisma.bookingPalConnection.create({
            data: {
              companyId: company.id,
              email: company.companyDetails.email,
              password: company.companyDetails.password,
              organizationId: organization.id,
            },
          })
        })
    }

    return bpConnection
  }

  async getWizardUrl(id: string) {
    const wizardClient = new WizardClient()
    const wizardToken = await wizardClient.getWizardToken(id)

    const wizardBase = 'https://wizardiframe.channelconnector.com'
    const encodedToken = encodeURIComponent(wizardToken)
    const wizardUrl = `${wizardBase}/jwt/${encodedToken}`

    console.log('wizardToken', wizardToken)
    console.log('encodedToken', encodedToken)
    return wizardUrl
  }
}

export default OrganizationsService
