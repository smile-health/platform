import i18n from '@/locales/i18n';

export const mapWasteStatus = (
  status: string,
  providerType?: string
): string => {
  if (!status) return '-';

  let displayProviderType = 'Pengolah';
  let displayLandfilled = 'Ditimbus';
  let displayRecycled = 'Diterima Pemanfaat';
  let displayDisposed = 'Diterima Pembuangan Akhir';
  let displayLandfilledEn = 'Landfilled';
  let displayRecycledEn = 'Recycled';

  if (providerType) {
    switch (providerType) {
      case 'TRANSPORTER_RECYCLER':
        displayProviderType = 'Pemanfaat';
        break;
      case 'TRANSPORTER_LANDFILL':
        displayProviderType = 'Penimbus';
        break;
      case 'TRANSPORTER_TREATMENT':
        displayLandfilled = 'Residu';
        displayRecycled = 'Residu';
        displayLandfilledEn = 'Residue';
        displayRecycledEn = 'Residue';
        break;
      case 'TRANSPORTER_GOVERNMENT_WASTE_BANK':
        displayDisposed = 'Diolah Bank Sampah';
        displayProviderType = 'Bank Sampah';
        break;
      default:
        displayProviderType = providerType;
        break;
    }
  }

  return i18n.t(`waste_status.${status}`, {
    providerType: displayProviderType,
    landfilled: displayLandfilled,
    recycled: displayRecycled,
    landfilledEn: displayLandfilledEn,
    recycledEn: displayRecycledEn,
    disposed: displayDisposed,
    defaultValue: status,
  });
};
