export function generateEmailSlug(input: string): string {
  // Convert the input string to lowercase
  const lowerCaseInput = input.toLowerCase()

  // Replace all characters except alphanumeric and spaces with hyphens
  const alphanumericAndHyphens = lowerCaseInput.replace(/[^a-z0-9\s]/g, '-')

  // Replace spaces with hyphens
  const hyphenated = alphanumericAndHyphens.replace(/\s+/g, '-')

  // Remove multiple hyphens
  const consolidatedHyphens = hyphenated.replace(/-+/g, '-')

  // Remove leading and trailing hyphens
  const slug = consolidatedHyphens.replace(/^-+|-+$/g, '')

  return slug
}

export default generateEmailSlug
