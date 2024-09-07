import { useState, useEffect } from 'react'
import { Group, Text, Flex, Loader } from '@mantine/core'
import type { FileWithPath } from '@mantine/dropzone'
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone'
import { v4 as uuidv4 } from 'uuid'
import vestaPhotoUtil from 'utils/vestaPhoto'
import uploadImage from 'pages/api/imageUpload'
import DragNDrop from 'components/common/DragNDrop/DragNDrop'

interface Props {
  photos: string[]
  setPhotos: (photos: string[]) => void
  onError: (error: string) => void
}

const ImageUpload = ({ photos, setPhotos, onError }: Props) => {
  const [files, setFiles] = useState<FileWithPath[]>([])
  const [photosLoading, setPhotosLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!files.length) return

    const uploadFiles = async () => {
      setPhotosLoading(true)

      const photoUrls = await Promise.all(
        files.map(async (file) => {
          const photoId = uuidv4()
          const photoUrl = await uploadImage(file, photoId)

          const isValid = await checkPhoto(vestaPhotoUtil.getMedium(photoUrl))
          if (!isValid) {
            return ''
          }
          return photoUrl
        })
      )

      const validPhotos = photoUrls.filter((url) => url !== '')
      if (validPhotos.length !== photoUrls.length) {
        onError(
          'One or more of your photos failed to upload. Please try again.'
        )
      }

      return validPhotos
    }

    void uploadFiles().then((photoUrls) => {
      setPhotos([...photos, ...photoUrls])
      setPhotosLoading(false)
    })
  }, [files])

  const checkPhoto = async (url: string, attemptNum = 1) => {
    if (attemptNum > 12) return false

    await new Promise((resolve) => setTimeout(resolve, 1000))
    const res = await fetch(url, { method: 'HEAD' })
    if (res.ok) return true

    const success = await checkPhoto(url, attemptNum + 1)
    if (success) return true
  }

  return (
    <Flex>
      <Dropzone
        w={270}
        h={160}
        onDrop={setFiles}
        onReject={() =>
          onError('Files are limited to 10 MB each, 10 files per upload.')
        }
        maxSize={10485760} // ~ 10mb
        accept={IMAGE_MIME_TYPE}
        maxFiles={10}
      >
        <Group
          position="center"
          spacing="sm"
          style={{ minHeight: 161, pointerEvents: 'none' }}
        >
          <Dropzone.Accept>Drop to add.</Dropzone.Accept>
          <Dropzone.Reject>Not a valid image.</Dropzone.Reject>
          <Dropzone.Idle>
            <div>
              <Text size="xl" color="vesta">
                Select up to 10 files at a time to upload (max size 10MB)
              </Text>
              <Text size="sm" color="neutral" inline mt={7}>
                or drag and drop them here
              </Text>
            </div>
          </Dropzone.Idle>
        </Group>
      </Dropzone>
      {photosLoading ? (
        <Loader />
      ) : (
        <DragNDrop photos={photos} setPhotos={setPhotos} />
      )}
    </Flex>
  )
}

export default ImageUpload
