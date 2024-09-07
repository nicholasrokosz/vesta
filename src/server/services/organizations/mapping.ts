import type { Organization } from '@prisma/client'
import type {
  Company,
  CompanyAddress,
  CompanyDetails,
  Phone,
  Policies,
} from 'server/integrations/bookingpal/types'
import generateEmailSlug from 'utils/generateEmailSlug'

export const mapOrganizationToCompany = (org: Organization): Company => {
  const phone: Phone = {
    countryCode: '+1',
    number: org.phone,
  }

  const address: CompanyAddress = {
    country: org.country,
    state: org.state,
    streetAddress: org.line1,
    city: org.city,
    zip: org.zip,
  }

  const details: CompanyDetails = {
    accountId: org.id,
    companyName: org.name,
    language: org.language,
    fullName: org.adminName,
    companyAddress: address,
    website: org.website,
    email: generateEmailSlug(org.name) + '@getvesta.io',
    phone: phone,
    password: 'badpassword', // TODO: generate and encrypt
    currency: org.currency,
  }

  const policies: Policies = {
    paymentPolicy: {
      type: 'FULL',
    },
    cancellationPolicy: {
      type: 'FULLY_REFUNDABLE',
    },
    feeTaxMandatory: {
      isFeeMandatory: true,
      isTaxMandatory: true,
    },
    terms: org.website,
    checkInTime: '15:00:00',
    checkOutTime: '11:00:00',
    leadTime: 1, // TODO: set this dynamically
  }

  const result: Company = {
    isCompany: true,
    companyDetails: details,
    policies: policies,
  }

  return result
}
