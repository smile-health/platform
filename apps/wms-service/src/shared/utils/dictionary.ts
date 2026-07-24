export const wasteManagementTranslations: Record<string, string> = {
  // Waste Bag Statuses
  INTERNAL_LANDFILL_IN_PROCESS: 'PENIMBUSAN_INTERNAL_SEDANG_BERJALAN',
  INTERNAL_LANDFILLED: 'DITIMBUS_INTERNAL',
  IN_TEMPORARY_STORAGE: 'TERSIMPAN',
  IN_COLD_STORAGE: 'DALAM_PENYIMPANAN_DINGIN',
  INCINERATION_IN_PROCESS: 'INSINERASI_SEDANG_BERJALAN',
  STERILIZATION_IN_PROCESS: 'STERILISASI_SEDANG_BERJALAN',
  INCINERATED: 'DIBAKAR',
  STERILISED: 'DISTERILISASI',
  READY_FOR_TRANSPORT: 'SIAP_UNTUK_DIANGKUT',
  TRANSPORTATION_REQUEST_CREATED: 'PERMINTAAN_PENGANGKUTAN_DIBUAT',
  IN_TRANSIT: 'DIANGKUT',
  READY_FOR_TREATMENT: 'DITERIMA_PENGOLAH',
  RECYCLED: 'DITERIMA_PEMANFAAT',
  LANDFILLED: 'DITIMBUS',
  COLLECTED: 'DIKUMPULKAN',
  DISPOSED: 'DIBUANG',

  // event
  WASTE_BAG_RESIDUE_CREATED: 'KANTONG_SAMPAH_RESIDU_DIBUAT',
  WASTE_BAG_DOMESTIC_CREATED: 'KANTONG_SAMPAH_DOMESTIK_DIBUAT',
  WASTE_BAG_IN_TEMPORARY_STORAGE: 'KANTONG_SAMPAH_DALAM_PENYIMPANAN_SEMENTARA',
  WASTE_BAG_OUT_TEMPORARY_STORAGE: 'KANTONG_SAMPAH_KELUAR_PENYIMPANAN_SEMENTARA',
  WASTE_BAG_IN_COLD_STORAGE: 'KANTONG_SAMPAH_DALAM_PENYIMPANAN_DINGIN',
  WASTE_BAG_OUT_COLD_STORAGE: 'KANTONG_SAMPAH_KELUAR_PENYIMPANAN_DINGIN',
  WASTE_BAG_TEMPORARY_STORAGE_EXPIRED: 'KANTONG_SAMPAH_PENYIMPANAN_SEMENTARA_KADALUARSA',
  WASTE_BAG_COLD_STORAGE_EXPIRED: 'KANTONG_SAMPAH_PENYIMPANAN_DINGIN_KADALUARSA',
  WASTE_BAG_GROUP_IN_TEMPORARY_STORAGE: 'KELOMPOK_KANTONG_SAMPAH_DALAM_PENYIMPANAN_SEMENTARA',
  WASTE_BAG_GROUP_OUT_TEMPORARY_STORAGE: 'KELOMPOK_KANTONG_SAMPAH_KELUAR_PENYIMPANAN_SEMENTARA',
  WASTE_BAG_GROUP_IN_COLD_STORAGE: 'KELOMPOK_KANTONG_SAMPAH_DALAM_PENYIMPANAN_DINGIN',
  WASTE_BAG_GROUP_OUT_COLD_STORAGE: 'KELOMPOK_KANTONG_SAMPAH_KELUAR_PENYIMPANAN_DINGIN',
  WASTE_BAG_GROUP_TEMPORARY_STORAGE_EXPIRED:
    'KELOMPOK_KANTONG_SAMPAH_PENYIMPANAN_SEMENTARA_KADALUARSA',
  WASTE_BAG_GROUP_COLD_STORAGE_EXPIRED: 'KELOMPOK_KANTONG_SAMPAH_PENYIMPANAN_DINGIN_KADALUARSA',
  WASTE_BAG_TREATMENT_GROUP_INCINERATE_IN_PROCESS:
    'KELOMPOK_PENGOLAHAN_KANTONG_SAMPAH_INSINERASI_SEDANG_BERJALAN',
  WASTE_BAG_TREATMENT_GROUP_STERILISE_IN_PROCESS:
    'KELOMPOK_PENGOLAHAN_KANTONG_SAMPAH_STERILISASI_SEDANG_BERJALAN',
  WASTE_BAG_TREATMENT_GROUP_INCINERATED: 'KELOMPOK_PENGOLAHAN_KANTONG_SAMPAH_DIBAKAR',
  WASTE_BAG_TREATMENT_GROUP_STERILISED: 'KELOMPOK_PENGOLAHAN_KANTONG_SAMPAH_DISTERILISASI',
  WASTE_BAG_GROUP_TRANSPORT_FOLLOW_UP: 'KELOMPOK_KANTONG_SAMPAH_TINDAK_LANJUT_PENGANGKUTAN',
  WASTE_BAG_GROUP_TRANSPORT_HANDOVER: 'KELOMPOK_KANTONG_SAMPAH_PENYERAHAN_PENGANGKUTAN',
  WASTE_BAG_GROUP_TRANSPORT_PICKUP: 'KELOMPOK_KANTONG_SAMPAH_PENGAMBILAN_PENGANGKUTAN',
  WASTE_BAG_GROUP_TREATMENT_RECEIVMENT: 'KELOMPOK_KANTONG_SAMPAH_PENERIMAAN_PENGOLAHAN',

  // Waste Bag Audit Trail Sources
  HEALTHCARE_FACILITY: 'FASILITAS_KESEHATAN',
  TRANSPORTER: 'PENGANGKUT',
  THIRD_PARTY: 'PIHAK_KETIGA',

  // Manual Scale Request Status
  REQUESTED: 'DIMINTA',
  HANDED_OVER: 'DISERAHKAN',
  WAITING_APPROVAL: 'MENUNGGU_PERSETUJUAN',
  APPROVED: 'DISETUJUI',
  REJECTED: 'DITOLAK',

  // Manual Scale Request Approval Types
  AUTO_APPROVAL: 'PERSETUJUAN_OTOMATIS',
  MANUAL_APPROVAL: 'PERSETUJUAN_MANUAL',

  // Asset Types
  SCALE: 'TIMBANGAN',
  INCINERATOR: 'INSINERATOR',
  AUTOCLAVE: 'AUTOCLAVE',
  COLD_STORAGE: 'PENYIMPANAN_DINGIN',

  // Partnership Provider Types
  TRANSPORTER_RECYCLER: 'PENGANGKUT_DAUR_ULANG',
  TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER: 'PENGANGKUT_PENYEDIA_PENGOLAHAN_SPESIALIS',
  TRANSPORTER_LANDFILL: 'PENGANGKUT_TPA',
  TRANSPORTER_TREATMENT: 'PENGANGKUT_PENGOLAHAN',
  TRANSPORTER_TREATMENT_PROVIDER: 'PENGANGKUT_PENYEDIA_PENGOLAHAN',
  TRANSPORTER_GOVERNMENT: 'PENGANGKUT_PEMERINTAH',
  LANDFILLER: 'PENGELOLA_TPA',
  TREATMENT_PROVIDER: 'PENYEDIA_PENGOLAHAN',
  RECYCLER: 'PENDAUR_ULANG',
  TREATMENT: 'PENGOLAHAN',
  SPECIALIZED_TREATMENT_PROVIDER: 'PENYEDIA_PENGOLAHAN_SPESIALIS',

  // Partnership Status
  PENDING: 'MENUNGGU',
  ACTIVE: 'AKTIF',
  SUSPENDED: 'DITANGGUHKAN',
  TERMINATED: 'DIAKHIRI',
  EXPIRED: 'KADALUARSA',

  // Vehicle Types
  BOX_TRUCK: 'TRUK_BOX',
  REFRIGERATED_BOX_TRUCK: 'TRUK_BOX_BERDINGIN',
  OPEN_BODY_TRUCK: 'TRUK_BAK_TERBUKA',
  TANKER: 'TANGKI',
  HAZARDOUS_MATERIAL_TRUCK: 'TRUK_BAHAN_BERBAHAYA',
  RADIOACTIVE_MATERIAL_TRUCK: 'TRUK_BAHAN_RADIOAKTIF',
  FLATBED_TRUCK: 'TRUK_DATAR',
  LOADER_TRUCK: 'TRUK_PEMUAT',
  TRAILER: 'TRAILER',
  VAN: 'VAN',

  // Asset Status
  OPERATIONAL: 'OPERASIONAL',
  UNDER_MAINTAINENCE: 'DALAM_PERAWATAN',
  OUT_OF_SERVICE: 'TIDAK_BEROPERASI',
  IDLE: 'MENGANGGUR',
  RETIRED: 'DINONAKTIFKAN',

  // Scheduled Event Types
  TIME_BOUND: 'BERDASARKAN_WAKTU',
  COUNT_BASED: 'BERDASARKAN_JUMLAH',
  WASTE_BAG_COLD_STORED_STARTED: 'KANTONG_SAMPAH_PENYIMPANAN_DINGIN_DIMULAI',
  WASTE_BAG_INCINERATION_STARTED: 'KANTONG_SAMPAH_INSINERASI_DIMULAI',
  WASTE_BAG_STERILISED_STARTED: 'KANTONG_SAMPAH_STERILISASI_DIMULAI',
  WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER: 'KANTONG_SAMPAH_TINDAK_LANJUT_KE_PENGANGKUT',
  WASTE_BAG_HANDOVER_TO_TRANSPORTER: 'KANTONG_SAMPAH_SERAH_TERIMA_KE_PENGANGKUT',
  WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER_EXTERNAL:
    'KANTONG_SAMPAH_TINDAK_LANJUT_KE_PENGANGKUT_EKSTERNAL',
  WASTE_BAG_HANDOVER_TO_TRANSPORTER_EXTERNAL: 'KANTONG_SAMPAH_SERAH_TERIMA_KE_PENGANGKUT_EKSTERNAL',
  WASTE_BAG_PICKUP_TO_TRANSPORTER_EXTERNAL: 'KANTONG_SAMPAH_PENGAMBILAN_KE_PENGANGKUT_EKSTERNAL',
  WASTE_BAG_HANDOVER_TO_TREATMENT_EXTERNAL: 'KANTONG_SAMPAH_SERAH_TERIMA_KE_PENGOLAHAN_EKSTERNAL',
  WASTE_BAG_RECEIVING_TO_TREATMENT_EXTERNAL: 'KANTONG_SAMPAH_PENERIMAAN_KE_PENGOLAHAN_EKSTERNAL',
  PARTNERSHIP_CONTRACT_EXPIRED: 'KONTRAK_KEMITRAAN_KADALUARSA',
  START_MANUAL_SCALE_REQUEST: 'MULAI_PERMINTAAN_TIMBANGAN_MANUAL',

  // Waste Classification - Storage Rule Types
  ROOM_TEMPERATURE: 'SUHU_RUANGAN',
  REFRIGERATED: 'DIDINGINKAN',
  FROZEN: 'DIBEKUKAN',
  VENTILATED_AREA: 'AREA_BERVENTILASI',
  DRY_AREA: 'AREA_KERING',
  SECURE_STORAGE: 'PENYIMPANAN_AMAN',

  // Waste Classification - Treatment Methods
  INCINERATION: 'INSINERASI',
  AUTOCLAVING: 'AUTOCLAVING',
  CHEMICAL_DISINFECTION: 'DISINFEKSI_KIMIA',
  MICROWAVE_DISINFECTION: 'DISINFEKSI_MICROWAVE',
  STERILIZATION: 'STERILISASI',
  LANDFILL: 'TPA',
  RECYCLING: 'DAUR_ULANG',
  COMPOSTING: 'PENGKOMPOSAN',

  // Waste Classification - Disposal Methods
  LANDFILL_DISPOSAL: 'PEMBUANGAN_TPA',
  INCINERATION_DISPOSAL: 'PEMBUANGAN_INSINERASI',
  RECYCLING_DISPOSAL: 'PEMBUANGAN_DAUR_ULANG',
  COMPOSTING_DISPOSAL: 'PEMBUANGAN_PENGKOMPOSAN',

  // Common Terms (sebelumnya sudah ada, ditambahkan untuk kelengkapan)
  WASTE_BAG_CREATED: 'KANTONG_SAMPAH_DIBUAT',
  WASTE_BAG_COLLECTED: 'KANTONG_SAMPAH_DIKUMPULKAN',
  WASTE_BAG_TRANSPORTED: 'KANTONG_SAMPAH_DIANGKUT',
  WASTE_BAG_TREATED: 'KANTONG_SAMPAH_DIOLAH',
  WASTE_BAG_DISPOSED: 'KANTONG_SAMPAH_DIBUANG',
  WASTE_BAG_AUTOCLAVE_FAILED: 'KANTONG_SAMPAH_AUTOCLAVE_GAGAL',
  WASTE_BAG_INCINERATED: 'KANTONG_SAMPAH_DIBAKAR',
  WASTE_BAG_COMPOSTED: 'KANTONG_SAMPAH_DIKOMPOS',
  INFECTIOUS_WASTE: 'LIMBAH_INFEKSIUS',
  PATHOLOGICAL_WASTE: 'LIMBAH_PATOLOGIS',
  SHARP_WASTE: 'LIMBAH_TAJAM',
  CHEMICAL_WASTE: 'LIMBAH_KIMIA',
  PHARMACEUTICAL_WASTE: 'LIMBAH_FARMAKOLOGIS',
  DISINFECTION: 'DISINFEKSI',
};

/**
 * Fungsi untuk mendapatkan terjemahan waste management term
 */
export function getWasteManagementTranslation(text: string): string | null {
  if (!text || typeof text !== 'string') return null;

  // Coba exact match pertama
  if (wasteManagementTranslations[text.toUpperCase()]) {
    return wasteManagementTranslations[text.toUpperCase()];
  }

  // Coba case-insensitive match
  const upperText = text.toUpperCase();
  for (const [key, value] of Object.entries(wasteManagementTranslations)) {
    if (key.toUpperCase() === upperText) {
      return value;
    }
  }

  return null;
}

/**
 * Fungsi untuk menerjemahkan array of texts menggunakan dictionary
 */
export function translateWasteManagementTexts(texts: string[]): string[] {
  return texts.map((text) => {
    const translation = getWasteManagementTranslation(text);
    return translation || text; // Return original jika tidak ditemukan terjemahan
  });
}

/**
 * Fungsi untuk check jika text adalah waste management term
 */
export function isWasteManagementTerm(text: string): boolean {
  return getWasteManagementTranslation(text) !== null;
}

export const NOTIFICATION_TYPE: { id: number; title: string; type: string }[] = [
  {
    id: 1,
    title: 'Bast Number requested',
    type: 'bast.create_request',
  },
  {
    id: 2,
    title: 'Manual Weighing Request Submitted',
    type: 'manual_request.manual_request_created',
  },
  {
    id: 3,
    title: 'Manual Weighing Request Approved',
    type: 'manual_request.manual_request_approved',
  },
  {
    id: 4,
    title: 'Manual Weighing Request Rejected',
    type: 'manual_request.manual_request_rejected',
  },
  {
    id: 5,
    title: 'Manual Weighing Request Expired',
    type: 'notification.update_status_manual_weighing_approval.message',
  },
  {
    id: 6,
    title: 'Inactive Entity',
    type: 'notification.inactive_entity.message',
  },
  {
    id: 7,
    title: 'Waste Stored > Maximum Temporary Storage Duration (2 Days)',
    type: 'notification.maximum_temporary_storage.message',
  },
  {
    id: 8,
    title: 'Waste Generation Below Monthly Projection',
    type: 'notification.waste_generartion_below_monthly_projection.message',
  },
  {
    id: 9,
    title: 'New Partnership Created',
    type: 'partnership.partnership_created',
  },
  {
    id: 10,
    title: 'Partnership Expiry Reminder',
    type: 'partnership.partnership_expired',
  },
  {
    id: 11,
    title: 'Partnership Expired',
    type: 'partnership.partnership_expired_exceed',
  },
  {
    id: 12,
    title: 'Partnership Updated',
    type: 'partnership.partnership_updated',
  },
  {
    id: 13,
    title: 'Waste Moved to External Temporary Storage',
    type: 'waste_bag.waste_bag_in_external_temporary_storage',
  },
  {
    id: 14,
    title: 'Waste Group In Cold Storage',
    type: 'waste_bag_group.waste_bag_group_in_cold_storage',
  },
  {
    id: 15,
    title: 'Waste Handover to Treatment External',
    type: 'waste_bag_group_transport.waste_bag_group_handover_to_treatment',
  },
  {
    id: 16,
    title: 'Transport Follow-up Required',
    type: 'waste_bag_group_transport.waste_bag_group_transport_follow_up',
  },
  {
    id: 17,
    title: 'Waste Handover Completed',
    type: 'waste_bag_group_transport.waste_bag_group_transport_handover',
  },
  {
    id: 18,
    title: 'Waste Pickup Scheduled',
    type: 'waste_bag_group_transport.waste_bag_group_transport_pickup',
  },
  {
    id: 19,
    title: 'Waste Received by Treatment Facility',
    type: 'waste_bag_group_treatment.waste_bag_group_treatment_receivment',
  },
  {
    id: 20,
    title: 'Waste Received by Treatment Facility',
    type: 'waste_bag_treatment_group.waste_bag_treatment_group_end_status',
  },
  {
    id: 21,
    title: 'Incineration Completed',
    type: 'waste_bag_treatment_group.waste_bag_treatment_group_incinerated',
  },
  {
    id: 22,
    title: 'Incineration In Process',
    type: 'waste_bag_treatment_group.waste_bag_treatment_group_incinerate_in_process',
  },
  {
    id: 23,
    title: 'Sterilization Completed',
    type: 'waste_bag_treatment_group.waste_bag_treatment_group_sterilised',
  },
];

export const WASTE_STATUS: Record<string, string> = {
  IN_TEMPORARY_STORAGE: 'Tersimpan',
  IN_COLD_STORAGE: 'Penyimpanan Dingin',
  INTERNAL_LANDFILLED: 'Ditimbus Internal',
  INCINERATED: 'Diolah Insinerasi Internal',
  INCINERATION_IN_PROCESS: 'Dalam Proses Insinerasi',
  STERILISED: 'Diolah Autoklaf Internal',
  STERILIZATION_IN_PROCESS: 'Sterilisasi / Disinfeksi',
  READY_FOR_TRANSPORT: 'Siap Diangkut',
  TRANSPORTATION_REQUEST_CREATED: 'Diserahkan ke Pengangkut',
  IN_TRANSIT: 'Diangkut',
  HANDOVER_TO_TREATMENT: 'Diserahkan ke Pengolah',
  READY_FOR_TREATMENT: 'Diterima Pengolah',
  RECYCLED: 'Didaur Ulang',
  LANDFILLED: 'Residu',
  COLLECTED: 'Diterima Pengangkutan Khusus',
  DISPOSED: 'Pembuangan Sampah',
  IN_THIRD_PARTY_STORAGE: 'Dalam Penyimpanan Pihak Ketiga',
};
