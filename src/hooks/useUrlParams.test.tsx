import { useRouter } from 'next/router'
import { render, screen, fireEvent } from '@testing-library/react'
import mockRouter from 'next-router-mock'
import { useUrlParams } from './useUrlParams'
import type { MRT_ColumnFiltersState } from 'mantine-react-table'

// eslint-disable-next-line
jest.mock('next/router', () => jest.requireActual('next-router-mock'))

const ComponentWithRouter = ({ href = '' }: { href: string }) => {
  const router = useRouter()

  return (
    <button onClick={() => void router.push(href)}>
      The current route is: {router.asPath}
    </button>
  )
}

const ComponentWithHook = () => {
  const { upsertParams, removeParams, syncColumnFiltersParams } = useUrlParams<
    'foo' | 'bar'
  >()
  const router = useRouter()
  const mockFiltersState: MRT_ColumnFiltersState = [
    { id: 'bar', value: '123456' },
  ]

  return (
    <>
      <p data-testid="router-path">{router.asPath}</p>
      <button
        data-testid="upsert-params"
        onClick={() => upsertParams({ foo: 'abc', bar: 'xyz' })}
      ></button>
      <button
        data-testid="remove-params"
        onClick={() => removeParams(['foo'])}
      ></button>
      <button
        data-testid="sync-params"
        onClick={() =>
          syncColumnFiltersParams(['foo', 'bar'], mockFiltersState)
        }
      ></button>
    </>
  )
}

describe('next-router-mock', () => {
  it('mocks the useRouter hook', () => {
    mockRouter.push('/initial-path').catch(console.error)

    render(<ComponentWithRouter href="/foo?bar=baz" />)

    expect(screen.getByRole('button').textContent).toEqual(
      'The current route is: /initial-path'
    )

    fireEvent.click(screen.getByRole('button'))

    expect(mockRouter).toMatchObject({
      asPath: '/foo?bar=baz',
      pathname: '/foo',
      query: { bar: 'baz' },
    })
  })
})

describe('useUrlParams hook', () => {
  it('upserts params correctly', async () => {
    await mockRouter.push('/').catch(console.error)

    render(<ComponentWithHook />)

    expect(screen.getByTestId('router-path').textContent).toEqual('/')

    fireEvent.click(screen.getByTestId('upsert-params'))

    await new Promise((r) => setTimeout(r, 1000))

    expect(screen.getByTestId('router-path').textContent).toEqual(
      '/?foo=abc&bar=xyz'
    )
  })

  it('removes params correctly', async () => {
    render(<ComponentWithHook />)

    fireEvent.click(screen.getByTestId('remove-params'))

    await new Promise((r) => setTimeout(r, 1000))

    expect(screen.getByTestId('router-path').textContent).toEqual('/?bar=xyz')
  })

  it('syncs params correctly', async () => {
    await mockRouter.push('/?foo=abc&bar=xyz').catch(console.error)

    render(<ComponentWithHook />)

    expect(screen.getByTestId('router-path').textContent).toEqual(
      '/?foo=abc&bar=xyz'
    )

    fireEvent.click(screen.getByTestId('sync-params'))

    await new Promise((r) => setTimeout(r, 1000))

    expect(screen.getByTestId('router-path').textContent).toEqual(
      '/?bar=123456'
    )
  })
})
