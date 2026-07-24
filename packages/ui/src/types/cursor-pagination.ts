import { TSingleOptions } from "./common";

export interface ICursorPaginationParams {
  paginate: number;
  cursor?: string | null;
  keyword?: string;
  status?: string;
}

export interface ICursorPaginatedResponse<T> {
  paginate: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  next_cursor?: string;
  previous_cursor?: string;
  total_count?: number;
  data: T[];
}

// Transaction-specific cursor pagination params
export interface ITransactionCursorPaginationParams extends ICursorPaginationParams {
  transaction_type_id?: number;
  transaction_reason_id?: number;
  is_order?: number;
  order_type?: number;
  entity_tag_id?: number;
  primary_vendor_id?: number;
  province_id?: number;
  regency_id?: number;
  customer_tag_id?: number;
  entity_for_consumption?: number;
  entity_id?: number;
  entity_user_id?: number | TSingleOptions;
  parent_material_id?: number;
  activity_id?: number;
  material_type_id?: number;
  material_id?: number;
  start_date?: string;
  end_date?: string;
}

// Response type for transaction cursor pagination
export type TransactionCursorPaginatedResponse = ICursorPaginatedResponse<any>;

// Utility functions for cursor handling
export class CursorUtils {
  /**
   * Encode cursor data to base64 string
   */
  static encodeCursor(data: Record<string, any>): string {
    return btoa(JSON.stringify(data));
  }

  /**
   * Decode base64 cursor string to data object
   */
  static decodeCursor(cursor: string): Record<string, any> {
    try {
      return JSON.parse(atob(cursor));
    } catch (error) {
      throw new Error('Invalid cursor format');
    }
  }

  /**
   * Create cursor from transaction data
   */
  static createTransactionCursor(transactionId: number, createdAt: string): string {
    return this.encodeCursor({
      id: transactionId,
      created_at: createdAt
    });
  }

  /**
   * Parse transaction cursor
   */
  static parseTransactionCursor(cursor: string): { id: number; created_at: string } {
    const decoded = this.decodeCursor(cursor);
    return {
      id: decoded.id,
      created_at: decoded.created_at
    };
  }
}

export type TransactionCountTotalData = {
  total: number;
}

export type TransactionCountTotalDataParams = {
  transaction_type_id?: number;
  transaction_reason_id?: number;
  is_order?: number;
  order_type?: number;
  entity_tag_id?: number;
  primary_vendor_id?: number;
  province_id?: number;
  regency_id?: number;
  customer_tag_id?: number;
  entity_for_consumption?: number;
  entity_id?: number;
  entity_user_id?: number;
  parent_material_id?: number;
  activity_id?: number;
  material_type_id?: number;
  material_id?: number;
  start_date?: string;
  end_date?: string;
}