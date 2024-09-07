const TAGS_REGEX = /{{(.*?)}}/gi

const renderMergeTags = (template: string, tags: MergeTags): string => {
  const caseInsensitiveTags = Object.keys(tags).reduce<MergeTags>(
    (result, key) => {
      result[key.toLowerCase()] = tags[key]
      return result
    },
    {}
  )

  return template.replace(TAGS_REGEX, (match, tagName: string) => {
    return caseInsensitiveTags[tagName.trim().toLowerCase()] || match
  })
}

export type MergeTags = Record<string, string>
export default renderMergeTags
