import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PaginatedUserRoles } from "./user-role.types";

vi.mock("./user-role.repository", () => ({
  findPaginated: vi.fn(),
}));

import * as repo from "./user-role.repository";
import { getAllUserRole } from "./user-role.service";

const findPaginatedMock = repo.findPaginated as unknown as ReturnType<typeof vi.fn>;

function makePaginated(): PaginatedUserRoles {
  return {
    data: [
      {
        id: 1,
        createdAt: new Date("2024-01-01"),
        createdBy: "user-1",
        name: "Admin",
        type: "ADMIN",
        regionId: 1,
      },
    ],
    pagination: { total: 1, pages: 1, currentPage: 1, perPage: 10 },
  };
}

describe("user-role.service getAllUserRole", () => {
  beforeEach(() => {
    findPaginatedMock.mockReset();
  });

  it("happy path: returns paginated data with sanitized defaults and lang defaulted to id", async () => {
    findPaginatedMock.mockResolvedValue(makePaginated());

    const result = await getAllUserRole({});

    expect(result).toEqual(makePaginated());
    expect(findPaginatedMock).toHaveBeenCalledWith({
      limit: 10,
      page: 1,
      search: undefined,
      lang: "id",
    });
  });

  it("passes through explicit limit/page/search", async () => {
    findPaginatedMock.mockResolvedValue(makePaginated());

    await getAllUserRole({ limit: 25, page: 3, search: "nurse" });

    expect(findPaginatedMock).toHaveBeenCalledWith({
      limit: 25,
      page: 3,
      search: "nurse",
      lang: "id",
    });
  });

  it("sanitizes a non-positive-integer limit/page back to defaults", async () => {
    findPaginatedMock.mockResolvedValue(makePaginated());

    await getAllUserRole({ limit: -5, page: 0 });

    expect(findPaginatedMock).toHaveBeenCalledWith({
      limit: 10,
      page: 1,
      search: undefined,
      lang: "id",
    });
  });

  it("caps limit at the maxLimit of 1000", async () => {
    findPaginatedMock.mockResolvedValue(makePaginated());

    await getAllUserRole({ limit: 5000 });

    expect(findPaginatedMock).toHaveBeenCalledWith({
      limit: 1000,
      page: 1,
      search: undefined,
      lang: "id",
    });
  });

  it("resolves lang to 'en' when Accept-Language contains 'en'", async () => {
    findPaginatedMock.mockResolvedValue(makePaginated());

    await getAllUserRole({ lang: "en-US,en;q=0.9" });

    expect(findPaginatedMock).toHaveBeenCalledWith({
      limit: 10,
      page: 1,
      search: undefined,
      lang: "en",
    });
  });

  it("resolves lang to 'id' for any Accept-Language not containing 'en'", async () => {
    findPaginatedMock.mockResolvedValue(makePaginated());

    await getAllUserRole({ lang: "id-ID,id;q=0.9" });

    expect(findPaginatedMock).toHaveBeenCalledWith({
      limit: 10,
      page: 1,
      search: undefined,
      lang: "id",
    });
  });

  it("wraps a repository failure in a plain un-flagged Error (mirrors GetUserRole.ts's 500 path)", async () => {
    findPaginatedMock.mockRejectedValue(new Error("connection refused"));

    await expect(getAllUserRole({})).rejects.toThrow("Error fetching all user role");
  });
});
