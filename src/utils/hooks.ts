import { useRouter } from 'next/router'

export const useIsPrintable = () => {
  const router = useRouter()
  return router.asPath.includes('#printable')
}

export const useHideNav = () => {
  const router = useRouter()
  return router.asPath.includes('#hidenav')
}
