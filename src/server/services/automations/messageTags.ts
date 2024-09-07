import type {
  CalendarEvent,
  Content,
  Listing,
  Reservation,
  Guest,
  User,
  Fee,
} from '@prisma/client'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { FeeType } from 'types'
import { formatTimeWithZone } from 'utils/dateFormats'
import type { MergeTags } from 'utils/mergeTags'
import parseName from 'utils/parseName'
import { camelToSentenceCase, formatAddress, titleCase } from 'utils/vesta'

export class MessageTagsBuilder {
  private tags: MergeTags = {}

  public getTags() {
    return this.tags
  }

  public getTag(name: string): string {
    return this.tags[name.toLowerCase()] || ''
  }

  public appendReservation(reservation: Reservation) {
    this.append({
      total_num_guests: (reservation.adults + reservation.children).toString(),
      num_adults: reservation.adults.toString(),
      num_children: reservation.children.toString(),
      channel_name: titleCase(reservation.channel),
    })

    return this
  }

  public appendGuest(guest: Guest) {
    const parsedName = parseName(guest.name)

    this.append({
      guest_name: parsedName.firstName,
      guest_full_name: guest.name,
    })

    return this
  }

  public appendCalendarEvent(event: CalendarEvent, timeZone: string) {
    this.append({
      check_in_time: formatTimeWithZone(event.fromDate, timeZone),
      checkout_time: formatTimeWithZone(event.toDate, timeZone),
    })

    return this
  }

  public appendListing(listing: Listing | null) {
    if (!listing) {
      return this
    }

    this.append({
      listing_address: formatAddress(listing),
      listing_city: listing.city,
      listing_num_beds: listing.beds.toString(),
      listing_num_baths: listing.baths.toString(),
      listing_unit_type: camelToSentenceCase(listing.unitType),
      listing_wifi_name: listing.wifiName || '',
      listing_wifi_password: listing.wifiPassword || '',
      listing_door_code: listing.doorCode || '',
      listing_url: listing.url || '',
    })

    return this
  }

  public appendListingContent(content: Content | null) {
    if (!content) {
      return this
    }

    this.append({
      listing_title: content.title,
    })

    return this
  }

  public appendCleaningFee(fees: Fee[] | null) {
    if (!fees) return this

    const cleaningFee = fees.find(
      (fee) => fee?.type === FeeType.CleaningFee
    )?.value

    if (cleaningFee) this.add('cleaning_fee', String(cleaningFee))

    return this
  }

  public appendPropertyManager(propertyManager: User | null) {
    if (!propertyManager) {
      return this
    }

    if (!!propertyManager.name) {
      const parsedName = parseName(propertyManager.name)
      this.add('property_manager_name', parsedName.firstName)
      this.add('property_manager_full_name', propertyManager.name)
    }

    if (!!propertyManager.email) {
      this.add('property_manager_email', propertyManager.email)
    }

    if (!!propertyManager.phone) {
      this.add(
        'property_manager_phone',
        formatPhoneNumberIntl(propertyManager.phone)
      )
    }

    return this
  }

  public add(name: string, value: string) {
    this.tags[name] = value
    return this
  }

  private append(tags: MergeTags) {
    this.tags = { ...this.tags, ...tags }
    return this
  }
}
