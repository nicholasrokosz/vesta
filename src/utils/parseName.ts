const parseName = (name: string): ParsedName => {
  const [firstName, ...rest] = name.trim().split(/\s+/) // split on whitespace
  const lastName = rest.pop()
  const middleNames = rest.map((name) => name.trim())

  return {
    firstName,
    lastName,
    middleNames,
  }
}

export interface ParsedName {
  firstName: string
  lastName?: string
  middleNames: string[]
}

export default parseName
