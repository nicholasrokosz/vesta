const buildUrl = (url: string, size: string) => {
  const fileName = url.split('/').pop()
  const id = fileName?.split('.')[0]
  const extension = fileName?.split('.').pop() || ''

  const sizedUrl = `https://d3m65jzbgi46ie.cloudfront.net/${
    id ?? ''
  }-${size}.${extension}`
  return sizedUrl
}

const getId = (url: string) => {
  const fileName = url.split('/').pop()
  const id = fileName?.split('.')[0]

  return id
}

const getSmall = (url: string) => {
  return buildUrl(url, 'sm')
}

const getMedium = (url: string) => {
  return buildUrl(url, 'md')
}

const vestaPhotoUtil = {
  getId,
  getSmall,
  getMedium,
}

export default vestaPhotoUtil
