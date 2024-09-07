var AWS = require('aws-sdk')
const sharp = require('sharp')

var s3 = new AWS.S3()

const dstBucket = 'vesta-photos'

exports.handler = async (event) => {
  const srcBucket = event.Records[0].s3.bucket.name
  const srcKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' ')
  )
  const extension = getExtension(srcKey)
  if (!extension) return
  const fileName = srcKey.substring(0, srcKey.length - extension.length - 1)

  var origimage = await s3
    .getObject({
      Bucket: srcBucket,
      Key: srcKey,
    })
    .promise()

  await s3
    .copyObject({
      Bucket: dstBucket,
      CopySource: `/${srcBucket}/${srcKey}`,
      Key: srcKey,
    })
    .promise()

  const widths = [
    { name: 'xxs', width: 30 },
    { name: 'xs', width: 60 },
    { name: 'sm', width: 120 },
    { name: 'md', width: 260 },
  ]
  await Promise.all(
    widths.map(async (size) => {
      console.log('starting get')
      var buffer = await sharp(origimage.Body).resize(size.width).toBuffer()
      const destparams = {
        Bucket: dstBucket,
        Key: `${fileName}-${size.name}.${extension}`,
        Body: buffer,
        ContentType: 'image',
      }

      console.log('starting put')
      return await s3.putObject(destparams).promise()
    })
  )

  const response = {
    statusCode: 200,
    body: JSON.stringify({ fileId: newFileName }),
  }
  return response
}

const getExtension = (fileName) => {
  const typeMatch = fileName.match(/\.([^.]*)$/)
  if (!typeMatch) {
    console.log('Could not determine the image type.')
    return
  }

  const imageType = typeMatch[1].toLowerCase()
  if (imageType != 'jpg' && imageType != 'png' && imageType != 'jpeg') {
    console.log(`Unsupported image type: ${imageType}`)
    return
  }
  return imageType
}
