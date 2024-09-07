export const formatCurrency = (
  value: number,
  format: string | undefined = 'en-US',
  currency: string | undefined = 'USD'
) => {
  return new Intl.NumberFormat(format, {
    style: 'currency',
    currency,
  }).format(value)
}
