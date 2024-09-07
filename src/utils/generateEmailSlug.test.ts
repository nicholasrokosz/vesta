import generateEmailSlug from './generateEmailSlug'

test('converts a string with special characters to a valid email slug', () => {
  const input =
    'Hello, World! This is a test string with special characters: *!@#$%^&*()'
  const expectedSlug =
    'hello-world-this-is-a-test-string-with-special-characters'
  const slug = generateEmailSlug(input)

  expect(slug).toBe(expectedSlug)
})

test('replaces special characters with hyphens', () => {
  const input = 'H!el.lo#Wor%ld'
  const expectedSlug = 'h-el-lo-wor-ld'
  const slug = generateEmailSlug(input)

  expect(slug).toBe(expectedSlug)
})
