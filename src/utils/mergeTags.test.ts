import type { MergeTags } from './mergeTags'
import renderMergeTags from './mergeTags'

describe('renderMergeTags', () => {
  it('replaces tags with the format {{<tag name>}}', () => {
    const template = 'Hello, {{name}}! You are {{age}} years old.'
    const tags: MergeTags = { name: 'Alice', age: '30' }
    const result = renderMergeTags(template, tags)

    expect(result).toEqual('Hello, Alice! You are 30 years old.')
  })

  it('replaces tags with whitespace within the tag', () => {
    const template =
      '{{  greeting}}, {{  name   }}! You are {{  age}} years old.'
    const tags = { greeting: 'Guten tag', name: 'Alice', age: '30' }
    const result = renderMergeTags(template, tags)

    expect(result).toEqual('Guten tag, Alice! You are 30 years old.')
  })

  it('replaces tags with case insensitivity', () => {
    const template = 'Hello, {{guestfirstname}}! You are {{AGe}} years old.'
    const tags: MergeTags = { guestFirstName: 'Alice', age: '30' }

    const result = renderMergeTags(template, tags)

    expect(result).toEqual('Hello, Alice! You are 30 years old.')
  })

  it('ignores tags that do not match in the template', () => {
    const template = '{{greeting}}, {{name}}! You are {{age}} years old.'
    const tags: MergeTags = { name: 'Alice', age: '30' }
    const result = renderMergeTags(template, tags)

    expect(result).toEqual('{{greeting}}, Alice! You are 30 years old.')
  })
})
