var AWS = require('aws-sdk')
var s3 = new AWS.S3()

const dstBucket = 'vesta-invoice'

exports.handler = async (event) => {
  const srcBucket = event.Records[0].s3.bucket.name
  const srcKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' ')
  )
  const extension = getExtension(srcKey)
  if (!extension) return
  const fileName = srcKey.substring(0, srcKey.length - extension.length - 1)

  await s3
    .copyObject({
      Bucket: dstBucket,
      CopySource: `/${srcBucket}/${srcKey}`,
      Key: srcKey,
      ContentType: extension == 'pdf' ? 'application/pdf' : 'image',
    })
    .promise()

  const response = {
    statusCode: 200,
    body: JSON.stringify({ fileId: fileName }),
  }
  return response
}

const getExtension = (fileName) => {
  const typeMatch = fileName.match(/\.([^.]*)$/)
  if (!typeMatch) {
    console.log('Could not determine the file type.')
    return
  }

  const fileType = typeMatch[1].toLowerCase()
  if (
    fileType != 'pdf' &&
    fileType != 'jpg' &&
    fileType != 'png' &&
    fileType != 'jpeg'
  ) {
    console.log(`Unsupported file type: ${fileType}`)
    return
  }
  return fileType
}
