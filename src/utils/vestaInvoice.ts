const getFile = (fileName: string | undefined) => {
  return fileName ? `https://d2hzmswyg1bprf.cloudfront.net/${fileName}` : ''
}

const vestaInvoiceUtil = {
  getFile,
}

export default vestaInvoiceUtil
