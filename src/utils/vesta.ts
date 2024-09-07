import type { ParsedUrlQuery } from 'querystring'
import type { IAddress } from 'types'

export const formatAddress = (address: IAddress): string => {
  if (!address) return ''

  const addressBuilder = [address.line1]
  if (!!address.line2) {
    addressBuilder.push(address.line2)
  }
  addressBuilder.push(address.city)

  if (address.state?.length > 0) {
    addressBuilder.push(address.state)
  }

  let result = addressBuilder.join(', ')
  if (address.zip?.length > 0) {
    result = `${result} ${address.zip}`
  }

  if (address.country != 'US') {
    result = `${result}, ${address.country}`
  }

  return result
}

const buildPhotoUrl = (url: string, size: string) => {
  const fileName = url.split('/').pop()
  const id = fileName?.split('.')[0] || ''
  const extension = fileName?.split('.').pop() || ''

  const sizedUrl = `https://d3m65jzbgi46ie.cloudfront.net/${id}-${size}.${extension}`
  return sizedUrl
}

const getId = (url: string): string => {
  const fileName = url.split('/').pop() || ''
  const id = fileName.split('.')[0]

  return id
}

interface Photo {
  id: string
  original: string
  small: string
  medium: string
}

export const getPhoto = (url: string): Photo => {
  const photo: Photo = {
    id: getId(url),
    original: url,
    small: buildPhotoUrl(url, 'sm'),
    medium: buildPhotoUrl(url, 'md'),
  }

  return photo
}

export const titleCase = (str: string) => {
  const strArr = str.split('')
  strArr[0] = strArr[0].toUpperCase()
  return strArr.join('')
}

export const formatDates = (datesArr: Date[]) => {
  // transforms the first two elements in datesArr from
  // dateStrings to strings with the abbreviated month and date
  // e.g. "July 04"
  const [start, end] = datesArr
    .slice(0, 2)
    .map((date: Date) => date.toDateString().split(' ').slice(1, -1).join(' '))
  if (start === end) return start
  return `${start} - ${end}`
}

export const camelToSentenceCase = (camelStr: string) =>
  camelStr
    .split('')
    .map((char: string, index) =>
      /[A-Z]/.test(char) && index !== 0 ? ` ${char.toLowerCase()}` : char
    )
    .join('')

export const upperSnakeToSentenceCase = (str: string) =>
  str
    .split('_')
    .map((word, i) =>
      word
        .split('')
        .map((char, j) => (i === 0 && j === 0 ? char : char.toLowerCase()))
        .join('')
    )
    .join(' ')

export const validateEmail = (email: string) => {
  const mailFormat = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )
  return mailFormat.test(email)
}

export const removeParams = (params: string[], routerQuery: ParsedUrlQuery) => {
  const queryCopy = { ...routerQuery }
  for (const param of params) delete queryCopy[param]
  return queryCopy
}

