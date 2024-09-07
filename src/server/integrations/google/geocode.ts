import NodeGeocoder from 'node-geocoder'

export const geocodeAddress = async (
  line1: string,
  line2: string,
  city: string,
  state: string,
  zip: string
) => {
  const geocoder = NodeGeocoder({
    provider: 'google',
    apiKey: process.env.GOOGLE_API_KEY,
  })
  return await geocoder.geocode(`${line1} ${line2} ${city} ${state} ${zip}`)
}
