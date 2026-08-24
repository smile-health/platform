import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findPaginated: vi.fn(),
  findByIdWithBags: vi.fn(),
}));
vi.mock("./waste-transport-external-group.repository", () => repoMock);

import * as service from "./waste-transport-external-group.service";

describe("waste-transport-external-group.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllWasteTransportExternalGroup", () => {
    it("defaults limit/page and passes an empty status list when nothing matches", async () => {
      repoMock.findPaginated.mockResolvedValue({ data: [], pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 } });
      await service.getAllWasteTransportExternalGroup({});
      expect(repoMock.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10, page: 1, wasteStatuses: [] })
      );
    });

    it("drops query values outside the allow-list (silently, no error)", async () => {
      repoMock.findPaginated.mockResolvedValue({ data: [], pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 } });
      await service.getAllWasteTransportExternalGroup({ status: "NOT_A_REAL_STATUS", externalTreatment: "BOGUS" });
      expect(repoMock.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ wasteStatuses: [], externalTreatment: undefined })
      );
    });

    it("adds role-derived statuses for a recycler role", async () => {
      repoMock.findPaginated.mockResolvedValue({ data: [], pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 } });
      await service.getAllWasteTransportExternalGroup({ role: "ROLE_RECYCLER" });
      const call = repoMock.findPaginated.mock.calls[0][0];
      expect(call.wasteStatuses).toContain("RECYCLED");
    });

    it("prefers entityId query param over the auth entityId", async () => {
      repoMock.findPaginated.mockResolvedValue({ data: [], pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 } });
      await service.getAllWasteTransportExternalGroup({ entityId: 5, authEntityId: 99 });
      expect(repoMock.findPaginated).toHaveBeenCalledWith(expect.objectContaining({ entityId: 5 }));
    });
  });

  describe("getWasteTransportExternalGroup", () => {
    it("throws FailedPrecondition when no group is found (not NotFound — preserved verbatim)", async () => {
      repoMock.findByIdWithBags.mockResolvedValue(null);
      await expect(service.getWasteTransportExternalGroup({ id: 1 })).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
      await expect(service.getWasteTransportExternalGroup({ id: 1 })).rejects.toBeInstanceOf(APIError);
    });

    it("returns the group on success", async () => {
      const entity = { id: 1, totalBagsCount: 1, totalWeightInKgs: 2, transporterId: 3, transportationStatus: "IN_TRANSIT", wasteBags: [] };
      repoMock.findByIdWithBags.mockResolvedValue(entity);
      await expect(service.getWasteTransportExternalGroup({ id: 1 })).resolves.toEqual(entity);
    });
  });
});
