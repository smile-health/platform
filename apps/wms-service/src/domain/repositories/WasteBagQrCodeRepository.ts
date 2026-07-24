import WasteBagQrCode from '../entities/WasteBagQrCode';
import { Readable } from 'stream';

export default interface WasteBagQrCodeRepository {
  createWasteBagQrCode(WasteBagQrCode: WasteBagQrCode): Promise<number>;
  updateWasteBagQrCode(WasteBagQrCode: WasteBagQrCode): Promise<void | null>;
  deleteWasteBagQrCode(id: string, deletedBy?: number): Promise<boolean | string>;
  getWasteBagQrCodeById(id: string, entityId: number): Promise<WasteBagQrCode | null | string>;
  getOneByWasteSourceId(id: number): Promise<number | undefined>;
  getAllWasteBagQrCodes(
    limit: number,
    page: number,
    entity_id: string | number | undefined,
    search?: string,
  ): Promise<{
    data: WasteBagQrCode[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }>;
  getWasteBagQrCodeAfterCreateByIds(ids: number[]): Promise<WasteBagQrCode[] | null>;
}
