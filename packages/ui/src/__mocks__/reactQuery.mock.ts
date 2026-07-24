jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn().mockImplementation(() => ({
    
  })),
  useQueryClient: jest.fn().mockImplementation(() => ({
    
  })),
  useQuery: jest.fn().mockImplementation(() => ({
    
  })),

  QueryClient: jest.fn(),

  QueryCache: jest.fn(),
}))