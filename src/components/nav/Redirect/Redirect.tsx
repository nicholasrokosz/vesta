import { useEffect } from 'react'
import { useRouter } from 'next/router'
interface Props {
  to: string
}

const Redirect = ({ to }: Props) => {
  const { replace } = useRouter()

  useEffect(() => {
    void replace(to, to)
  }, [])

  return <p> </p>
}

export default Redirect
