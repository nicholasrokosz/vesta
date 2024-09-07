import type { Content, Rules, Availability, Amenity } from '@prisma/client'
import { formatAddress } from 'utils/vesta'
import possibleAmenities from 'utils/amenities'

interface Props {
  listing: {
    name: string
    line1: string
    line2: string | null
    city: string
    state: string
    zip: string
    country: string
    wifiName: string | null
    wifiPassword: string | null
    doorCode: string | null
  }
  content: Content | null
  rules: Rules | null
  availability: Availability | null
  amenities: Amenity[] | null
}

export class GPTSystemPrompt {
  private listing: {
    name: string
    line1: string
    line2: string | null
    city: string
    state: string
    zip: string
    country: string
    wifiName: string | null
    wifiPassword: string | null
    doorCode: string | null
  }
  private content: Content | null
  private rules: Rules | null
  private availability: Availability | null
  private amenities: Amenity[] | null
  private prompt: string

  constructor({ listing, content, rules, availability, amenities }: Props) {
    this.listing = listing
    this.content = content
    this.rules = rules
    this.availability = availability
    this.amenities = amenities
    this.prompt = ''
  }

  public buildPromptForListing = (): string => {
    this.addAddress()
    this.addWifi()
    this.addDoorCode()
    this.addAvailability()
    this.addAmenities()
    this.addRules()
    this.addContent()

    return this.prompt
  }

  private addAddress = () => {
    const formattedAddress = formatAddress(this.listing)
    const address = `The property, ${this.listing.name}, is located at ${formattedAddress}. `
    this.prompt += address
  }

  private addWifi = () => {
    const wifi =
      this.listing.wifiName && this.listing.wifiPassword
        ? `The wifi name is ${this.listing.wifiName} and the password is ${this.listing.wifiPassword}. `
        : ''
    this.prompt += wifi
  }

  private addDoorCode = () => {
    const doorCode = this.listing.doorCode
      ? `The door code is ${this.listing.doorCode}. `
      : ''
    this.prompt += doorCode
  }

  private addAmenities = () => {
    const listingAmenities: string[] = []
    if (this.amenities) {
      this.amenities.forEach(({ typeId, note }): void => {
        const amenity = possibleAmenities.find((amenity) =>
          amenity.typeIds.includes(typeId)
        )
        if (amenity) {
          listingAmenities.push(amenity.name + (note ? ` (${note})` : ''))
        }
      })
    }
    const amenitiesString = listingAmenities
      ? `Amenities include ${listingAmenities.join(', ')}. `
      : ''
    this.prompt += amenitiesString
  }

  private addRules = () => {
    const suitableForChildren =
      this.rules && this.rules.children
        ? 'It is not suitable for children. '
        : 'It is suitable for children.'
    const pets = this.rules?.pets
      ? `Pets are allowed, a fee may be applied. `
      : 'Pets are not allowed. '
    const smoking = this.rules?.smoking
      ? 'Smoking is allowed. '
      : 'Smoking is not allowed. '

    const rules = `${suitableForChildren} ${pets} ${smoking}`
    this.prompt += rules
  }

  private addContent = () => {
    const description = this.content
      ? `${this.stripHtmlAndLineBreaks(this.content.description)} `
      : ''
    const aiInfo = this.content?.aiInfo
      ? this.stripHtmlAndLineBreaks(this.content.aiInfo)
      : ''
    const contentPrompt = `${description} ${aiInfo}`
    this.prompt += contentPrompt
  }

  private addAvailability = () => {
    const checkInOut = this.availability
      ? `Check-in is at ${this.availability.checkIn} and checkout is at ${this.availability.checkOut}. `
      : ''
    this.prompt += checkInOut
  }

  private stripHtmlAndLineBreaks = (text: string): string => {
    const strippedText = text.replace(/(<([^>]+)>)/gi, '').replace(/\n/g, '')
    return strippedText
  }
}
