/**
 * Cursor pagination helper utilities
 * Shared functions for cursor-based pagination across modules
 */

/**
 * Interface for cursor pagination parameters
 */
export interface ICursorPaginationParams {
  paginate: number;
  cursor?: string;
}

/**
 * Interface for cursor paginated response
 */
export interface ICursorPaginatedResponse<T> {
  paginate: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  next_cursor?: string;
  previous_cursor?: string;
  total_count?: number;
  data: T[];
}

/**
 * Response class for cursor-based pagination
 */
export class CursorPaginatedResponse<T> implements ICursorPaginatedResponse<T> {
  paginate: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  next_cursor?: string;
  previous_cursor?: string;
  total_count?: number;
  data: T[];

  constructor(
    req: ICursorPaginationParams,
    data: T[] = [],
    hasNextPage: boolean = false,
    hasPreviousPage: boolean = false,
    nextCursor?: string,
    previousCursor?: string,
    totalCount?: number,
  ) {
    this.paginate = req.paginate;
    this.has_next_page = hasNextPage;
    this.has_previous_page = hasPreviousPage;
    this.next_cursor = nextCursor;
    this.previous_cursor = previousCursor;
    this.total_count = totalCount;
    this.data = data;
  }
}

/**
 * Utility functions for cursor encoding/decoding
 */
export class CursorUtils {
  /**
   * Encode cursor data to base64 string
   */
  static encodeCursor(data: Record<string, unknown>): string {
    return Buffer.from(JSON.stringify(data)).toString("base64");
  }

  /**
   * Decode base64 cursor string to data object
   */
  static decodeCursor(cursor: string): Record<string, unknown> {
    try {
      return JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
    } catch {
      throw new Error("Invalid cursor format");
    }
  }
}
