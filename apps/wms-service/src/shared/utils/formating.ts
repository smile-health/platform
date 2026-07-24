import { WasteSourceAttributes } from "../../infrastructure/database/models/WasteSourceModel";

export const formatTitleCase = (str: string) => {
    return str
        .toLowerCase() // Convert entire string to lowercase first
        .split('_') // Split into words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
        .join(' '); // Rejoin with spaces
};

export const formatDate = (date: Date) => {
    // format ke "YYYY-MM-DD HH:mm:ss"
    const pad = (n: number) => String(n).padStart(2, '0');

    return (
        date.getFullYear() +
        '-' +
        pad(date.getMonth() + 1) +
        '-' +
        pad(date.getDate()) +
        ' ' +
        pad(date.getHours()) +
        ':' +
        pad(date.getMinutes()) +
        ':' +
        pad(date.getSeconds())
    );
};

export function uniqueById<T extends { id: any }>(arr: T[]): T[] {
    const seen = new Set();
    return arr.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
    });
}

type BFFWasteBagStorageDate = {
    timestamp: string;
    difference: {
        days: number;
        hours: number;
        minutes: number;
        milliseconds: number;
        isExpired: boolean;
    };
};

const isValidDate = (value?: string): boolean => {
    if (!value) return false;
    const d = new Date(value);
    return !isNaN(d.getTime()); // valid kalau bukan NaN
};

export const getBFFWasteBagStorageDate = (
    futureTimestamp?: string,
): BFFWasteBagStorageDate | undefined => {
    if (!futureTimestamp || !isValidDate(futureTimestamp)) {
        return undefined;
    }

    const parsedFutureDate = new Date(futureTimestamp);
    const now = new Date();

    const msDiff = parsedFutureDate.getTime() - now.getTime();

    // hitung selisih dalam satuan waktu
    const daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));
    const hoursDiff = Math.floor((msDiff / (1000 * 60 * 60)) % 24);
    const minutesDiff = Math.floor((msDiff / (1000 * 60)) % 60);

    const storageDate = {
        timestamp: parsedFutureDate.toISOString(),
        difference: {
            days: daysDiff,
            hours: hoursDiff,
            minutes: minutesDiff,
            milliseconds: msDiff,
            isExpired: msDiff < 0,
        },
    };

    return storageDate;
};

export const getWasteSourceName = (wasteSource?: WasteSourceAttributes): string => {
    switch (wasteSource?.sourceType) {
        case 'EXTERNAL':
            return wasteSource.externalHealthcareFacilityName || 'Unknown External Source';
        case 'INTERNAL':
            return wasteSource.internalSourceName || 'Unknown Internal Source';
        case 'INTERNAL_TREATMENT':
            return wasteSource.internalTreatmentName || 'Unknown Internal Treatment';
        default:
            return 'Unknown Source';
    }
};
