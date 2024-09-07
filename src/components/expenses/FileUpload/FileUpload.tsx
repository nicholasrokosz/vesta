import { useState, useEffect } from 'react'
import { Flex, Loader } from '@mantine/core'
import { v4 as uuidv4 } from 'uuid'
import uploadInvoice from 'pages/api/invoiceUpload'
import { FileInput } from '@mantine/core'
import { IconUpload } from '@tabler/icons-react'

interface Props {
  label: string
  setDocument: (document: string) => void
}

const FileUpload = ({ label, setDocument }: Props) => {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<boolean>(false)
  const [documentLoading, setDocumentLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!file) return

    const uploadFile = async () => {
      setDocumentLoading(true)

      const fileId = uuidv4()
      const { fileName, documentUrl } = await uploadInvoice(file, fileId)

      const isValid = await checkFile(documentUrl)
      if (!isValid) {
        return { fileName: '', documentUrl: '' }
      }

      if (!documentUrl) {
        setError(true)
      }

      return { fileName, documentUrl }
    }

    void uploadFile().then(({ fileName }) => {
      setDocument(fileName)
      setDocumentLoading(false)
    })
  }, [file])

  const checkFile = async (url: string, attemptNum = 1) => {
    if (attemptNum > 12) return false

    await new Promise((resolve) => setTimeout(resolve, 1000))
    const res = await fetch(url, { method: 'HEAD' })
    if (res.ok) return true

    const success = await checkFile(url, attemptNum + 1)
    if (success) return true
  }

  return (
    <Flex>
      {documentLoading ? (
        <Loader />
      ) : (
        <FileInput
          value={file}
          accept="image/png,image/jpeg,application/pdf"
          onChange={setFile}
          aria-label={label}
          placeholder={label}
          error={error ? 'The file failed to upload. Please try again.' : null}
          icon={<IconUpload size={14} />}
        />
      )}
    </Flex>
  )
}

export default FileUpload
