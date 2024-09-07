function formatShareToPercentage(shareAsDecimal: number) {
  if (isNaN(shareAsDecimal)) {
    return ' (0%)'
  }

  const share = shareAsDecimal * 100
  return ` (${share % 1 != 0 ? share.toFixed(1) : share}%)`
}

export default formatShareToPercentage
