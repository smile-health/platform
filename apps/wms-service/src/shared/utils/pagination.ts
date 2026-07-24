interface PaginationParams {
  limit?: number | string;
  page?: number | string;
  maxLimit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  };
}

interface SequelizePaginationOptions {
  model: any;
  where?: any;
  order?: any[];
  include?: any[];
  attributes?: string[];
}

export const paginationUtils = {
  /**
   * Sanitize pagination parameters
   */
  sanitizePaginationParams(params: PaginationParams): { limit: number; page: number } {
    const maxLimit = params.maxLimit || 1000;

    let limit = Number(params.limit);
    let page = Number(params.page);

    limit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, maxLimit) : 10;
    page = Number.isInteger(page) && page > 0 ? page : 1;

    return { limit, page };
  },

  /**
   * Calculate pagination metadata
   */
  calculatePagination(totalCount: number, limit: number, page: number) {
    const totalPages = limit > 0 ? Math.ceil(totalCount / limit) : 0;

    return {
      total: totalCount,
      pages: totalPages,
      currentPage: page,
      perPage: limit,
    };
  },

  /**
   * Generic Sequelize pagination
   */
  async paginateSequelize<T>(
    options: SequelizePaginationOptions & PaginationParams,
  ): Promise<PaginationResult<T>> {
    const { limit, page } = this.sanitizePaginationParams({
      limit: options.limit,
      page: options.page,
      maxLimit: options.maxLimit,
    });

    const { count, rows } = await options.model.findAndCountAll({
      limit,
      offset: (page - 1) * limit,
      where: options.where,
      order: options.order,
      include: options.include,
      attributes: options.attributes,
    });

    const totalCount = Number(count) || 0;

    return {
      data: rows,
      pagination: this.calculatePagination(totalCount, limit, page),
    };
  },

  /**
   * Format raw data with pagination
   */
  formatPaginationResult<T>(
    data: T[],
    totalCount: number,
    limit: number,
    page: number,
  ): PaginationResult<T> {
    return {
      data,
      pagination: this.calculatePagination(totalCount, limit, page),
    };
  },
};
