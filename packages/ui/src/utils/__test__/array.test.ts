import { sortObjectsByKey } from "#utils/array";

let result;

beforeEach(() => {
    // given
    result = null
})

afterAll(() => {
    result = null
})

const testData = {
  case1: [1, 2, 3, 4, 5],
  case2: [{ id: 3 }, { id: 1 }, { id: 2 }],
  case3: [],
  case4: [{ id: 3 }, { id: 1 }, { id: 2 }, { name: 'test' }, { name: 'abc' }],
}

describe('sortObjectsByKey', () => {
  it('should return current array when input is invalid array object', () => {
    // when
    result = sortObjectsByKey(testData.case1, 'id')
    // then
    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('should sort array of objects by specified key', () => {
    // when
    result = sortObjectsByKey(testData.case2, 'id')
    // then
    expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
  })

  it('should return empty array when input is empty', () => {
    // when
    result = sortObjectsByKey(testData.case3, 'id')
    // then
    expect(result).toEqual([])
  })

  it('should return empty array when input is empty', () => {
    // when
    result = sortObjectsByKey(testData.case4, 'id')
    // then
    expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { name: 'test' }, { name: 'abc' }])
  })
})