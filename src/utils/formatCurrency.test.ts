import { formatCurrency } from './formatCurrency'

test('returns the data formatted correctly', () => {
  const result = formatCurrency(1000)
  expect(result).toBe('$1,000.00')
})

test('returns the data formatted correctly', () => {
  const result = formatCurrency(0)
  expect(result).toBe('$0.00')
})
