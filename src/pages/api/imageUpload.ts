import type { FileWithPath } from 'file-selector'

const uploadImage = async (
  file: FileWithPath,
  fileId: string
): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const url = `https://s08grvw7j0.execute-api.us-east-2.amazonaws.com/prod/${fileId}.${
    extension ?? ''
  }`
  await fetch(url, {
    method: 'PUT',
    body: file,
  })

  const photoUrl = `https://d3m65jzbgi46ie.cloudfront.net/${fileId}.${
    extension ?? ''
  }`
  return photoUrl
}

export default uploadImage
