import type { Kysely } from "kysely"

/**
 * Seed target_groups dengan kelompok sasaran BMHP dari Master_Data_Sasaran.xlsx
 * Cek existing by title sebelum insert agar idempotent
 */
export async function up(db: Kysely<any>): Promise<void> {
  const rows = [
    { title: "Balita Usia 2 Tahun dengan Anemia" },
    { title: "Balita Usia 3-6 Tahun dengan Risiko Talasemia" },
    { title: "Dewasa Usia 40 - 59 Tahun dengan HT & DM" },
    { title: "Estimasi Kasus TB (Semua Usia)" },
    { title: "Anak Usia Sekolah Kelas 1-6 (7-12 thn)" },
    { title: "Sasaran Skrining Anemia & Talasemia (Sekolah)" },
    { title: "Lansia ≥ 60 thn dengan HT & DM" },
    { title: "Usia > 18 Tahun" },
    { title: "Seluruh Usia" },
    { title: "Perempuan 30-69 thn (Skrining Kanker)" },
    { title: "Anak Usia Sekolah (7-12 thn) dengan Faktor Risiko" },
    { title: "Balita (Umum)" },
    { title: "Balita Usia 3-6 Tahun dengan Risiko" },
    { title: "Balita Usia 2 Tahun" },
    { title: "Bayi Baru Lahir (SHK)" },
    { title: "Dewasa Usia 18 - 59 Tahun" },
    { title: "Estimasi Kasus TB Anak (0-14 thn)" },
    { title: "Ibu Hamil" },
    { title: "Siswa Kelas 1-12 dengan Risiko Hepatitis B" },
    { title: "Siswa Kelas 10-12 (16-17 thn)" },
    { title: "Remaja Putri Kelas 10 (16 thn)" },
    { title: "Siswa Kelas 7-12 dengan Risiko Hepatitis C" },
    { title: "Siswa Kelas 7 (13 thn)" },
    { title: "Siswa Kelas 8-9 dengan Faktor Risiko" },
    { title: "Catin Laki-laki & Perempuan (18-49 thn)" },
    { title: "Lansia (Umum)" },
    { title: "Catin Perempuan (18-49 thn)" },
    { title: "Sasaran Skrining Fungsi Ginjal" },
    { title: "Seluruh Usia (Wilayah Endemis Tinggi)" },
    { title: "Usia > 40 tahun" },
    { title: "Sasaran Skrining GDS" },
    { title: "Kelas 8-12 (13-17 tahun) dengan faktor risiko Talasemia" },
    { title: "Suspek Malaria (Wilayah Endemis)" },
    { title: "Lansia ≥ 60 thn dengan Risiko Hepatitis C" },
    { title: "Lansia ≥ 60 thn dengan Risiko Hepatitis B" },
    { title: "Dewasa 18-59 thn dengan Risiko Hepatitis C" },
    { title: "Dewasa 18-59 thn dengan Risiko Hepatitis B" },
    { title: "Kelas 7 dengan Anemia" },
    { title: "Laki-laki dan Perempuan usia ≥ 45 tahun" },
    { title: "Prevalensi Hepatitis B (2,4%)" },
    { title: "Prevalensi Hepatitis C (0,5%)" },
    { title: "Prevalensi Obesitas sentral (36,8%)" },
    { title: "Prevalensi Dislipidemia (8,8%)" },
    { title: "Prevalensi Diabetes Melitus (11,7%)" },
  ]

  const existing = await db
    .selectFrom("target_groups")
    .select("title")
    .where("deleted_at", "is", null)
    .execute()

  const existingTitles = new Set(existing.map((r) => r.title))

  const toInsert = rows.filter((r) => !existingTitles.has(r.title))
  if (toInsert.length > 0) {
    await db.insertInto("target_groups").values(toInsert).execute()
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  // Hanya hapus yang di-insert migration ini.
  // "Ibu Hamil" dikecualikan karena sudah ada sebelum migration ini dibuat.
  const titles = [
    "Balita Usia 2 Tahun dengan Anemia",
    "Balita Usia 3-6 Tahun dengan Risiko Talasemia",
    "Dewasa Usia 40 - 59 Tahun dengan HT & DM",
    "Estimasi Kasus TB (Semua Usia)",
    "Anak Usia Sekolah Kelas 1-6 (7-12 thn)",
    "Sasaran Skrining Anemia & Talasemia (Sekolah)",
    "Lansia ≥ 60 thn dengan HT & DM",
    "Usia > 18 Tahun",
    "Seluruh Usia",
    "Perempuan 30-69 thn (Skrining Kanker)",
    "Anak Usia Sekolah (7-12 thn) dengan Faktor Risiko",
    "Balita (Umum)",
    "Balita Usia 3-6 Tahun dengan Risiko",
    "Balita Usia 2 Tahun",
    "Bayi Baru Lahir (SHK)",
    "Dewasa Usia 18 - 59 Tahun",
    "Estimasi Kasus TB Anak (0-14 thn)",
    // "Ibu Hamil" dikecualikan - sudah ada sebelum migration ini
    "Siswa Kelas 1-12 dengan Risiko Hepatitis B",
    "Siswa Kelas 10-12 (16-17 thn)",
    "Remaja Putri Kelas 10 (16 thn)",
    "Siswa Kelas 7-12 dengan Risiko Hepatitis C",
    "Siswa Kelas 7 (13 thn)",
    "Siswa Kelas 8-9 dengan Faktor Risiko",
    "Catin Laki-laki & Perempuan (18-49 thn)",
    "Lansia (Umum)",
    "Catin Perempuan (18-49 thn)",
    "Sasaran Skrining Fungsi Ginjal",
    "Seluruh Usia (Wilayah Endemis Tinggi)",
    "Usia > 40 tahun",
    "Sasaran Skrining GDS",
    "Kelas 8-12 (13-17 tahun) dengan faktor risiko Talasemia",
    "Suspek Malaria (Wilayah Endemis)",
    "Lansia ≥ 60 thn dengan Risiko Hepatitis C",
    "Lansia ≥ 60 thn dengan Risiko Hepatitis B",
    "Dewasa 18-59 thn dengan Risiko Hepatitis C",
    "Dewasa 18-59 thn dengan Risiko Hepatitis B",
    "Kelas 7 dengan Anemia",
    "Laki-laki dan Perempuan usia ≥ 45 tahun",
    "Prevalensi Hepatitis B (2,4%)",
    "Prevalensi Hepatitis C (0,5%)",
    "Prevalensi Obesitas sentral (36,8%)",
    "Prevalensi Dislipidemia (8,8%)",
    "Prevalensi Diabetes Melitus (11,7%)",
  ]

  await db
    .deleteFrom("target_groups")
    .where("title", "in", titles)
    .execute()
}
