import parseName from './parseName'

describe('parseName', () => {
  describe('parseName', () => {
    it('should parse a full name with a first name and a last name', () => {
      const fullName = 'John Adams'

      expect(parseName(fullName)).toEqual({
        firstName: 'John',
        lastName: 'Adams',
        middleNames: [],
      })
    })

    it('should parse a full name with a first name, one middle name, and a last name', () => {
      const fullName = 'John Quincy Adams'
      expect(parseName(fullName)).toEqual({
        firstName: 'John',
        lastName: 'Adams',
        middleNames: ['Quincy'],
      })
    })

    it('should parse a full name with a first name, multiple middle names, and a last name', () => {
      const fullName = 'John Quincy Adam Smith'
      expect(parseName(fullName)).toEqual({
        firstName: 'John',
        lastName: 'Smith',
        middleNames: ['Quincy', 'Adam'],
      })
    })

    it('should parse a full name with leading/trailing/excess white spaces', () => {
      const fullName = '  John Quincy   Adams   '
      expect(parseName(fullName)).toEqual({
        firstName: 'John',
        lastName: 'Adams',
        middleNames: ['Quincy'],
      })
    })

    it('should parse a full name with only one name as the first name and no last name', () => {
      const fullName = 'John'
      expect(parseName(fullName)).toEqual({
        firstName: 'John',
        lastName: undefined,
        middleNames: [],
      })
    })
  })
})
