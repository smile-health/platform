/**
 * Menghitung jarak antara dua titik koordinat menggunakan formula Haversine
 * @param lat1 Latitude titik pertama
 * @param lon1 Longitude titik pertama
 * @param lat2 Latitude titik kedua
 * @param lon2 Longitude titik kedua
 * @returns Jarak dalam kilometer
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius bumi dalam kilometer
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

/**
 * Mengkonversi derajat ke radian
 * @param degrees Nilai dalam derajat
 * @returns Nilai dalam radian
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Memvalidasi apakah dua titik koordinat berada dalam radius maksimum yang ditentukan
 * @param lat1 Latitude titik pertama
 * @param lon1 Longitude titik pertama
 * @param lat2 Latitude titik kedua
 * @param lon2 Longitude titik kedua
 * @param maxRadiusKm Radius maksimum dalam kilometer
 * @returns true jika jarak <= radius maksimum, false jika sebaliknya
 */
export function validateRadius(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    maxRadiusKm: number,
): boolean {
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    return distance <= maxRadiusKm;
}

/**
 * Memvalidasi koordinat GPS yang valid
 * @param lat Latitude
 * @param lon Longitude
 * @returns true jika koordinat valid
 */
export function isValidCoordinate(lat: number, lon: number): boolean {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}
