const uploadInvoice = async (
  file: File,
  fileId: string
): Promise<{ fileName: string; documentUrl: string }> => {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const fileName = `${fileId}.${extension ?? ''}`

  // upload file to vesta-invoice-upload bucket
  const url = `https://7e2pru6wx3.execute-api.us-east-2.amazonaws.com/prod/${fileName}`
  await fetch(url, {
    method: 'PUT',
    body: file,
    headers: new Headers({
      'content-type': extension === 'pdf' ? 'application/pdf' : 'image/jpeg',
    }),
  })

  // get from vesta-invoice bucket
  const documentUrl = `https://d2hzmswyg1bprf.cloudfront.net/${fileName}`

  return { fileName, documentUrl }
}

export default uploadInvoice
