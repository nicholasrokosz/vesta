import {
  createShareSplitFromManagerShare,
  sumShareSplits,
  subtractShareSplits,
  EMPTY_SHARE_SPLIT,
} from './revenue'

describe('createShareSplit', () => {
  it('should return correct split for given amount and manager share', () => {
    const amount = 100
    const managerShare = 0.2
    const result = createShareSplitFromManagerShare({
      amount: amount,
      managerShare: managerShare,
    })
    expect(result).toEqual({
      amount: 100,
      managerAmount: 20,
      ownerAmount: 80,
      managerShare: 0.2,
      ownerShare: 0.8,
    })
  })

  it('should throw error for managerShare less than 0', () => {
    expect(() =>
      createShareSplitFromManagerShare({
        amount: 100,
        managerShare: -0.1,
      })
    ).toThrowError('Manager share must be between 0 and 1, but received -0.1')
  })

  it('should throw error for managerShare greater than 1', () => {
    expect(() =>
      createShareSplitFromManagerShare({
        amount: 100,
        managerShare: 1.1,
      })
    ).toThrowError('Manager share must be between 0 and 1, but received 1.1')
  })

  it('should return managerAmount as 0 and ownerAmount as the full amount for managerShare of 0', () => {
    const result = createShareSplitFromManagerShare({
      amount: 100,
      managerShare: 0,
    })
    expect(result).toEqual({
      amount: 100,
      managerAmount: 0,
      ownerAmount: 100,
      managerShare: 0,
      ownerShare: 1,
    })
  })

  it('should return managerAmount as the full amount and ownerAmount as 0 for managerShare of 1', () => {
    const result = createShareSplitFromManagerShare({
      amount: 100,
      managerShare: 1,
    })
    expect(result).toEqual({
      amount: 100,
      managerAmount: 100,
      ownerAmount: 0,
      managerShare: 1,
      ownerShare: 0,
    })
  })
})

describe('sumShareSplits', () => {
  it('should correctly sum up multiple share splits', () => {
    const split1 = {
      amount: 100,
      managerAmount: 20,
      ownerAmount: 80,
      managerShare: 0.2,
      ownerShare: 0.8,
    }

    const split2 = {
      amount: 200,
      managerAmount: 100,
      ownerAmount: 100,
      managerShare: 0.5,
      ownerShare: 0.5,
    }

    const result = sumShareSplits(split1, split2)
    expect(result).toEqual({
      amount: 300,
      managerAmount: 120,
      ownerAmount: 180,
      managerShare: 0.4,
      ownerShare: 0.6,
    })
  })

  it('should return a split with all zeroes when no arguments are provided', () => {
    const result = sumShareSplits()
    expect(result).toEqual({
      amount: 0,
      managerAmount: 0,
      ownerAmount: 0,
      managerShare: 0,
      ownerShare: 0,
    })
  })

  it('should handle summing splits with zero amounts', () => {
    const split1 = {
      amount: 0,
      managerAmount: 0,
      ownerAmount: 0,
      managerShare: 0,
      ownerShare: 0,
    }

    const split2 = {
      amount: 200,
      managerAmount: 100,
      ownerAmount: 100,
      managerShare: 0.5,
      ownerShare: 0.5,
    }

    const result = sumShareSplits(split1, split2)
    expect(result).toEqual({
      amount: 200,
      managerAmount: 100,
      ownerAmount: 100,
      managerShare: 0.5,
      ownerShare: 0.5,
    })
  })

  it("should handle summing splits where total manager and owner amounts don't add up to total amount", () => {
    const split1 = {
      amount: 100,
      managerAmount: 60,
      ownerAmount: 50,
      managerShare: 0.6,
      ownerShare: 0.5,
    }

    const split2 = {
      amount: 200,
      managerAmount: 100,
      ownerAmount: 80,
      managerShare: 0.5,
      ownerShare: 0.4,
    }

    const result = sumShareSplits(split1, split2)
    expect(result).toEqual({
      amount: 300,
      managerAmount: 160,
      ownerAmount: 130,
      managerShare: 160 / 300,
      ownerShare: 130 / 300,
    })
  })
})

describe('subtractShareSplits', () => {
  it('should subtract two ShareSplits correctly', () => {
    const first = createShareSplitFromManagerShare({
      amount: 100,
      managerShare: 0.4,
    }) // amount=100, managerShare=0.4
    const second = createShareSplitFromManagerShare({
      amount: 50,
      managerShare: 0.5,
    }) // amount=50, managerShare=0.5

    const result = subtractShareSplits(first, second)

    expect(result.amount).toBe(50) // 100 - 50
    expect(result.managerAmount).toBe(15) // 40 - 25
    expect(result.ownerAmount).toBe(35) // 60 - 25
  })

  it('should subtract multiple ShareSplits correctly', () => {
    const first = createShareSplitFromManagerShare({
      amount: 100,
      managerShare: 0.4,
    })
    const second = createShareSplitFromManagerShare({
      amount: 50,
      managerShare: 0.5,
    })
    const third = createShareSplitFromManagerShare({
      amount: 10,
      managerShare: 0.7,
    })

    const result = subtractShareSplits(first, second, third)

    expect(result.amount).toBe(40) // 100 - 50 - 10
    expect(result.managerAmount).toBe(8) // 40 - 25 - 7
    expect(result.ownerAmount).toBe(32) // 60 - 25 - 3
  })

  it('should return the same ShareSplit if no other splits are provided', () => {
    const first = createShareSplitFromManagerShare({
      amount: 100,
      managerShare: 0.4,
    })

    const result = subtractShareSplits(first)

    expect(result).toEqual(first)
  })

  it('should return an empty ShareSplit when subtracted by itself', () => {
    const first = createShareSplitFromManagerShare({
      amount: 100,
      managerShare: 0.4,
    })

    const result = subtractShareSplits(first, first)

    expect(result).toEqual(EMPTY_SHARE_SPLIT)
  })

  it('should handle negative results correctly', () => {
    const first = createShareSplitFromManagerShare({
      amount: 100,
      managerShare: 0.4,
    })
    const second = createShareSplitFromManagerShare({
      amount: 150,
      managerShare: 0.5,
    })

    const result = subtractShareSplits(first, second)

    expect(result.amount).toBe(-50)
    expect(result.managerAmount).toBe(-35) // 40 - 75
    expect(result.ownerAmount).toBe(-15) // 60 - 75
  })
})
