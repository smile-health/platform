import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findById: vi.fn(),
  findByQrCodeId: vi.fn(),
  findManyByQrCodeIds: vi.fn(),
  findPaginated: vi.fn(),
  create: vi.fn(),
  updateStatusByQrCodeIds: vi.fn(),
  findTransactionsPaginated: vi.fn(),
  findSummaryByCharacteristics: vi.fn(),
  findWasteSourceSummary: vi.fn(),
  findLogBookPaginated: vi.fn(),
  findHistory: vi.fn(),
  findWasteGroupDetails: vi.fn(),
  findInternalTreatmentDetails: vi.fn(),
}));
vi.mock("./waste-bag.repository", () => repoMock);

const topicsMock = vi.hoisted(() => ({
  wasteBagCreated: { publish: vi.fn() },
  wasteBagStored: { publish: vi.fn() },
  wasteBagTreatmentStarted: { publish: vi.fn() },
  wasteBagTreated: { publish: vi.fn() },
  wasteBagTransportRequested: { publish: vi.fn() },
  wasteBagPickedUp: { publish: vi.fn() },
  wasteBagHandedOverToTreatment: { publish: vi.fn() },
  wasteBagReceivedForTreatment: { publish: vi.fn() },
  wasteBagFinalized: { publish: vi.fn() },
  ScheduledEventTypes: {
    WasteBagInternalLandfillStarted: "WASTE_BAG_INTERNAL_LANDFILL_STARTED",
    WasteBagColdStoredStarted: "WASTE_BAG_COLD_STORED_STARTED",
    WasteBagIncinerationStarted: "WASTE_BAG_INCINERATION_STARTED",
    WasteBagSterilisedStarted: "WASTE_BAG_STERILISED_STARTED",
    WasteBagFollowUpToTransporter: "WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER",
    WasteBagHandoverToTransporter: "WASTE_BAG_HANDOVER_TO_TRANSPORTER",
    WasteBagFollowUpToTransporterExternal: "WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER_EXTERNAL",
    WasteBagHandoverToTransporterExternal: "WASTE_BAG_HANDOVER_TO_TRANSPORTER_EXTERNAL",
    WasteBagPickupToTransporterExternal: "WASTE_BAG_PICKUP_TO_TRANSPORTER_EXTERNAL",
    WasteBagHandoverToTreatmentExternal: "WASTE_BAG_HANDOVER_TO_TREATMENT_EXTERNAL",
    WasteBagReceivingToTreatmentExternal: "WASTE_BAG_RECEIVING_TO_TREATMENT_EXTERNAL",
    WasteBagSterilisedExternalStarted: "WASTE_BAG_STERILISED_EXTERNAL_STARTED",
    WasteBagIncineratesExternalStarted: "WASTE_BAG_INCENERATES_EXTERNAL_STARTED",
    WasteBagLandfilledExternalStarted: "WASTE_BAG_LANDFILLED_EXTERNAL_STARTED",
    WasteBagAlreadyReceived: "WASTE_BAG_ALREADY_RECEIVED",
    PartnershipContractExpired: "PARTNERSHIP_CONTRACT_EXPIRED",
    StartManualScaleRequest: "START_MANUAL_SCALE_REQUEST",
  },
}));
vi.mock("../../messaging/topics", () => topicsMock);

import * as service from "./waste-bag.service";

describe("waste-bag.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWasteBagById", () => {
    it("throws FailedPrecondition when id is missing/NaN", async () => {
      await expect(service.getWasteBagById("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
      await expect(service.getWasteBagById("abc")).rejects.toBeInstanceOf(APIError);
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.getWasteBagById("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "WasteBag not found",
      });
    });
  });

  describe("createWasteBag", () => {
    it("throws InvalidArgument on invalid input (e.g. bad scaleMethod)", async () => {
      await expect(
        service.createWasteBag({
          createdBy: "u",
          healthcareFacilityId: 1,
          wasteSourceId: 1,
          wasteClassificationId: 1,
          scaleMethod: "NOT_A_METHOD",
          wasteBagQrCodeId: "QR1",
        })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("creates the bag and publishes a self-transition status event", async () => {
      const created = {
        id: 1,
        wasteBagQrCodeId: "QR1",
        wasteStatus: "IN_TEMPORARY_STORAGE",
        createdAt: new Date(),
        createdBy: "u",
        healthcareFacilityId: 1,
        wasteSourceId: 1,
        wasteClassificationId: 1,
        scaleMethod: "MANUAL",
        ownedBy: "HEALTHCARE_FACILITY",
        isTreated: false,
        isDisposed: false,
      };
      repoMock.create.mockResolvedValue(created);

      const result = await service.createWasteBag({
        createdBy: "u",
        healthcareFacilityId: 1,
        wasteSourceId: 1,
        wasteClassificationId: 1,
        scaleMethod: "MANUAL",
        wasteBagQrCodeId: "QR1",
      });

      expect(result).toEqual(created);
      expect(topicsMock.wasteBagCreated.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          wasteBagId: 1,
          previousStatus: "IN_TEMPORARY_STORAGE",
          newStatus: "IN_TEMPORARY_STORAGE",
        })
      );
    });
  });

  describe("temporaryStoreWasteBags", () => {
    it("throws InvalidArgument when wasteBagQrCodeIds is empty", async () => {
      await expect(
        service.temporaryStoreWasteBags({ wasteBagQrCodeIds: [], updatedBy: "u" })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws FailedPrecondition (no isValidationError flag in the original) when nothing matched", async () => {
      repoMock.updateStatusByQrCodeIds.mockResolvedValue([]);
      await expect(
        service.temporaryStoreWasteBags({ wasteBagQrCodeIds: ["QR1"], updatedBy: "u" })
      ).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Failed to store waste bag in temporary storage",
      });
    });

    it("publishes one status-change event per affected bag, using each bag's PRIOR status", async () => {
      repoMock.updateStatusByQrCodeIds.mockResolvedValue([
        { id: 1, wasteBagQrCodeId: "QR1", wasteStatus: "IN_COLD_STORAGE" },
        { id: 2, wasteBagQrCodeId: "QR2", wasteStatus: "READY_FOR_TRANSPORT" },
      ]);

      const result = await service.temporaryStoreWasteBags({
        wasteBagQrCodeIds: ["QR1", "QR2"],
        updatedBy: "u",
      });

      expect(result).toEqual({ affected: 2 });
      expect(topicsMock.wasteBagStored.publish).toHaveBeenCalledTimes(2);
      expect(topicsMock.wasteBagStored.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          wasteBagId: 1,
          previousStatus: "IN_COLD_STORAGE",
          newStatus: "IN_TEMPORARY_STORAGE",
        })
      );
      expect(topicsMock.wasteBagStored.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          wasteBagId: 2,
          previousStatus: "READY_FOR_TRANSPORT",
          newStatus: "IN_TEMPORARY_STORAGE",
        })
      );
    });
  });

  describe("internalLandfillWasteBags / steriliseWasteBags / incinerateWasteBags", () => {
    it("throws FailedPrecondition('UNCOMPLETED_ACTION_TYPE') when no bags match (mirrors result === null branch)", async () => {
      repoMock.updateStatusByQrCodeIds.mockResolvedValue([]);
      await expect(
        service.internalLandfillWasteBags({
          wasteBagQrCodeIds: ["QR1"],
          treatmentStartTime: new Date().toISOString(),
          treatmentEndTime: new Date().toISOString(),
          createdBy: "u",
        })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition, message: "UNCOMPLETED_ACTION_TYPE" });
    });

    it("returns true and publishes on success", async () => {
      repoMock.updateStatusByQrCodeIds.mockResolvedValue([
        { id: 1, wasteBagQrCodeId: "QR1", wasteStatus: "INTERNAL_LANDFILL_IN_PROCESS" },
      ]);
      const result = await service.steriliseWasteBags({
        wasteBagQrCodeIds: ["QR1"],
        treatmentStartTime: new Date().toISOString(),
        treatmentEndTime: new Date().toISOString(),
        createdBy: "u",
      });
      expect(result).toBe(true);
      expect(topicsMock.wasteBagTreatmentStarted.publish).toHaveBeenCalledWith(
        expect.objectContaining({ newStatus: "STERILISED" })
      );
    });
  });

  describe("getWasteGroupDetails", () => {
    it("throws FailedPrecondition when wasteGroupId is empty", async () => {
      await expect(service.getWasteGroupDetails("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("throws FailedPrecondition when not found", async () => {
      repoMock.findWasteGroupDetails.mockResolvedValue(null);
      await expect(service.getWasteGroupDetails("g1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });
  });
});
