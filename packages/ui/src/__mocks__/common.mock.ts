jest.mock('nuqs', () => ({
  parseAsString: {
    withDefault: jest.fn().mockReturnValue({
      withOptions: jest.fn(),
    }),
  },
  parseAsInteger: {
    withDefault: jest.fn().mockReturnValue({
      withOptions: jest.fn(),
    }),
  },
  parseAsFloat: {
    withDefault: jest.fn().mockReturnValue({
      withOptions: jest.fn(),
    }),
  },
  useQueryState: jest.fn().mockReturnValue(['', jest.fn()]),
  useQueryStates: jest.fn().mockReturnValue([{}, jest.fn()]),
}))