// test-utils/axios.helpers.ts
import { handleAxiosResponse } from '#utils/api'
import { AxiosResponse } from 'axios'

/**
 * Factory function to create mock AxiosResponse objects
 */
const createMockAxiosResponse = <T = any>(
  data: T,
  status: number = 200,
  statusText: string = 'OK'
): AxiosResponse<T> => ({
  data,
  status,
  statusText,
  headers: {},
  config: {
    method: 'get',
    url: 'http://localhost',
    headers: {},
    transformRequest: [],
    transformResponse: [],
    timeout: 0,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    maxBodyLength: -1,
  },
  request: {}
})

// Test data factories
const testData = {
  user: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin'
  },
  users: [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ],
  apiError: {
    404: {
      message: "user tidak ada",
      traceId: "xxxxxxxxxxxxxx"
    }
  },
  pagination: {
    item_per_page: 10,
    list_pagination: [10, 25, 50, 100],
    page: 1,
    total_page: 5,
    total_item: 50
  }
}

// Parameterized test data
const statusCodeTestCases = [
  { status: 200, description: 'OK' },
  { status: 201, description: 'Created' },
  { status: 202, description: 'Accepted' },
  { status: 204, description: 'No Content' },
  { status: 400, description: 'Bad Request' },
  { status: 401, description: 'Unauthorized' },
  { status: 403, description: 'Forbidden' },
  { status: 404, description: 'Not Found' },
  { status: 422, description: 'Unprocessable Entity' },
  { status: 500, description: 'Internal Server Error' }
]

// Usage in tests:
describe('handleAxiosResponse - Using Helpers', () => {
  describe('Status code handling', () => {
    test.each(statusCodeTestCases.filter(tc => tc.status !== 204))(
      'should preserve status code $status for $description',
      ({ status, description }) => {
        // given
        const response = createMockAxiosResponse(
          testData.user,
          status,
          description
        )

        // when
        const result = handleAxiosResponse(response)

        // then
        expect(result.statusCode).toBe(status)
        expect(result).toMatchObject(testData.user)
      }
    )
  })

  describe('Data type preservation', () => {
    const dataTypeCases = [
      {
        name: 'object data',
        data: testData.user,
        expected: { ...testData.user, statusCode: 200 }
      },
      {
        name: 'array data',
        data: testData.users,
        expected: {
          0: testData.users[0],
          1: testData.users[1],
          statusCode: 200
        }
      },
      {
        name: 'nested object data',
        data: testData.pagination,
        expected: { ...testData.pagination, statusCode: 200 }
      }
    ]

    test.each(dataTypeCases)(
      'should handle $name correctly',
      ({ data, expected }) => {
        // given
        const response = createMockAxiosResponse(data)

        // when
        const result = handleAxiosResponse(response)

        // then
        expect(result).toEqual(expected)
      }
    )
  })
})

// Integration tests with real-world scenarios
describe('handleAxiosResponse - Integration Scenarios', () => {
  describe('API Response Patterns', () => {
    it('should handle typical REST API success response', () => {
      // given
      const apiResponse = createMockAxiosResponse({
        success: true,
        data: testData.user,
        message: 'User retrieved successfully'
      })

      // when
      const result = handleAxiosResponse(apiResponse)

      // then
      expect(result).toEqual({
        success: true,
        data: testData.user,
        message: 'User retrieved successfully',
        statusCode: 200
      })
    })

    it('should handle paginated list response', () => {
      // given
      const paginatedResponse = createMockAxiosResponse({
        data: testData.users,
        pagination: testData.pagination
      })

      // when
      const result = handleAxiosResponse(paginatedResponse)

      // then
      expect(result).toEqual({
        data: testData.users,
        pagination: {
          item_per_page: 10,
          list_pagination: [10, 25, 50, 100],
          page: 1,
          total_page: 5,
          total_item: 50
        },
        statusCode: 200
      })
    })

    it('should handle error response with details', () => {
      // given
      const errorResponse = createMockAxiosResponse(
        testData.apiError[404],
        404,
        'Not Found'
      )

      // when
      const result = handleAxiosResponse(errorResponse)

      // then
      expect(result).toEqual({
        message: "user tidak ada",
        traceId: "xxxxxxxxxxxxxx",
        statusCode: 404
      })
    })
  })
})