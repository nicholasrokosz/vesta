/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextApiRequest, NextApiResponse } from 'next'

interface AsyncMessage {
  supplierId: number
  type: 'BP_VALIDATION' | 'PROCESSING_IMAGES'
}

interface ValidationMessage extends AsyncMessage {
  type: 'BP_VALIDATION'
  validation: Validation[]
}

interface Validation {
  productId: number
  validationErrors: string
  valid: boolean
}

interface ImagesMessage extends AsyncMessage {
  type: 'PROCESSING_IMAGES'
  processingImage: ProductImage[]
}

interface ProductImage {
  name: string
  productId: string
  altId?: string
  images: Image[]
}

interface Image {
  success: boolean
  type: 'IMPORT' | 'DELETE'
  url: string
  version: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const message = req.body as AsyncMessage

  console.log(
    JSON.stringify({ bpNotificationWebhook: `${message.type}`, message })
  )

  if (message.type === 'BP_VALIDATION') {
    const validationMessage = message as ValidationMessage
  } else if (message.type === 'PROCESSING_IMAGES') {
    const imagesMessage = message as ImagesMessage
  } else {
    console.log('unknown message type', message)
  }

  res.status(200).json({ message: 'success' })
}
