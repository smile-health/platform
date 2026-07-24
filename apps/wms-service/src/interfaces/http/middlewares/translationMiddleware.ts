import { Request, Response, NextFunction } from 'express';
import {
    translateSingleText,
    getLanguageConfig,
    translateMultiple,
} from '../../../shared/utils/translation';

interface TranslationFieldMapping {
    [endpoint: string]: string[];
}

const TRANSLATION_FIELD_MAPPING: TranslationFieldMapping = {
    '/asset': ['name', 'description'],
    '/notification': ['title', 'message'],
    '/waste': ['wasteStatus'],
    '/waste-transport-external-group': ['wasteStatus'],
    '/waste-transportation-group': ['wasteStatus'],
    '/waste-treatment-external-group': ['wasteStatus'],
    '/waste-bag-treatment-group': ['wasteStatus'],
    '/waste-hierarchy': ['name', 'description'],
    // '/asset-model': ['name', 'description', 'assetType', 'asset_type'],
    // '/entity-settings': ['settingName', 'setting_name', 'settingValue', 'setting_value'],
    // '/global-settings': ['settingName', 'setting_name', 'settingValue', 'setting_value'],
    // '/healthcare-facility-asset': ['assetStatus', 'asset_status'],
    // '/manual-scale': ['status', 'approvalType', 'approval_type'],
    // '/partnership-vehicle-map': ['vehicleType', 'vehicle_type'],
    // '/partnership': ['consumerType', 'consumer_type', 'providerType', 'provider_type'],
    // '/waste': [
    //     'wasteStatus',
    //     'waste_status',
    //     'transportationStatus',
    //     'transportation_status',
    //     'sourceType',
    //     'treatmentMethod',
    //     'disposalMethod',
    //     'ownedBy',
    //     'owned_by',
    //     'description',
    // ],
    // '/audit-trail': ['event', 'wasteBagStatus', 'waste_bag_status', 'source', 'remarks'],
    // '/waste-classification': [
    //     'wasteBagColorCode',
    //     'storageRuleType',
    //     'storage_rule_type',
    //     'treatmentMethod',
    //     'treatment_method',
    //     'disposalMethod',
    //     'disposal_method',
    //     'allowedVehicleType',
    //     'allowed_vehicle_type',
    // ],
    // '/waste-hierarchy': ['name', 'description'],
    // '/waste-source': [
    //     'internalSourceName',
    //     'internal_source_name',
    //     'internalTreatmentName',
    //     'internal_treatment_name',
    //     'externalHealthcareFacilityName',
    //     'external_healthcare_facility_name',
    // ],
};

const SCHEDULE_EVENT_FIELDS = ['eventType', 'event_type'];

function getEndpointFromPath(path: string): string {
    // Remove query parameters
    const pathWithoutQuery = path.split('?')[0];
    const segments = pathWithoutQuery.split('/').filter((segment) => segment !== '');
    console.log('Path segments:', segments, 'from path:', pathWithoutQuery);

    if (segments.length >= 3 && segments[0] === 'api' && segments[1] === 'v1') {
        const endpoint = `/${segments[2]}`;
        console.log('Mapped endpoint:', endpoint);
        return endpoint;
    }

    const fallback = segments.length > 0 ? `/${segments[0]}` : '/';
    console.log('Fallback endpoint:', fallback);
    return fallback;
}

/**
 * Middleware untuk POST request - Translate ID to EN
 */
async function translatePostData(req: Request, _res: Response, next: NextFunction) {
    const lang = req.headers['lang'] || 'en';

    if (lang === 'id') {
        try {
            const endpoint = getEndpointFromPath(req.originalUrl);
            const fieldsToTranslate = TRANSLATION_FIELD_MAPPING[endpoint] || [];

            if (fieldsToTranslate.length > 0 && req.body) {
                const { source, target } = getLanguageConfig(lang);

                // Buat salinan body untuk menghindari modifikasi langsung
                const translatedBody = { ...req.body };

                // Translate setiap field yang diperlukan
                for (const field of fieldsToTranslate) {
                    if (req.body[field] && typeof req.body[field] === 'string') {
                        translatedBody[field] = await translateSingleText(
                            req.body[field],
                            source,
                            target,
                        );
                    }
                }

                // Ganti body request dengan yang sudah diterjemahkan
                req.body = translatedBody;
            }
        } catch (error) {
            console.error('Error in POST translation middleware:', error);
            // Lanjutkan tanpa terjemahan jika error
        }
    }

    next();
}

/**
 * Menerjemahkan object fields dengan nested support
 */
async function translateObjectFields(
    obj: any,
    fields: string[],
    targetLanguage: string,
): Promise<any> {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    const { source, target } = getLanguageConfig(targetLanguage);

    if (Array.isArray(obj)) {
        return await Promise.all(
            obj.map((item) => translateObjectFields(item, fields, targetLanguage)),
        );
    }

    const translatedObj = { ...obj };

    // Kumpulkan semua teks yang perlu diterjemahkan
    const textsToTranslate: string[] = [];
    const fieldMappings: { field: string; index: number }[] = [];
    let textIndex = 0;

    for (const field of fields) {
        if (translatedObj[field] && typeof translatedObj[field] === 'string') {
            textsToTranslate.push(translatedObj[field]);
            fieldMappings.push({ field, index: textIndex });
            textIndex++;
        }
    }

    // Lakukan terjemahan sekaligus jika ada teks yang perlu diterjemahkan
    if (textsToTranslate.length > 0) {
        const translatedTexts = await translateMultiple(textsToTranslate, source, target);

        // Map hasil terjemahan kembali ke field yang sesuai
        fieldMappings.forEach(({ field, index }) => {
            translatedObj[field] = translatedTexts[index];
        });
    }

    return translatedObj;
}

/**
 * Menerjemahkan nested fields secara rekursif
 */
async function translateNestedFields(
    obj: any,
    fields: string[],
    targetLanguage: string,
): Promise<any> {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return await Promise.all(
            obj.map((item) => translateNestedFields(item, fields, targetLanguage)),
        );
    }

    const translatedObj = { ...obj };

    for (const key in translatedObj) {
        if (typeof translatedObj[key] === 'object' && translatedObj[key] !== null) {
            translatedObj[key] = await translateNestedFields(
                translatedObj[key],
                fields,
                targetLanguage,
            );
        } else if (fields.includes(key) && typeof translatedObj[key] === 'string') {
            try {
                const { source, target } = getLanguageConfig(targetLanguage);
                translatedObj[key] = await translateSingleText(translatedObj[key], source, target);
            } catch (error) {
                console.error(`Error translating nested field ${key}:`, error);
            }
        }
    }

    return translatedObj;
}

/**
 * Middleware untuk GET response - Translate EN to ID
 */
async function translateResponseData(req: Request, res: Response, next: NextFunction) {
    const lang = req.headers['lang'] || 'en';

    if (lang === 'id') {
        // Override res.json to intercept response
        const originalJson = res.json;

        res.json = function (data: any) {
            (async () => {
                try {
                    if (data && typeof data === 'object') {
                        const endpoint = getEndpointFromPath(req.originalUrl);
                        const fieldsToTranslate = TRANSLATION_FIELD_MAPPING[endpoint];

                        if (fieldsToTranslate) {
                            const translatedData = await translateObjectFields(
                                data,
                                fieldsToTranslate,
                                lang,
                            );

                            const nestedTranslatedData = await translateNestedFields(
                                translatedData,
                                [...fieldsToTranslate, ...SCHEDULE_EVENT_FIELDS],
                                lang,
                            );

                            return originalJson.call(this, nestedTranslatedData);
                        }

                        const generalTranslatedData = await translateNestedFields(
                            data,
                            SCHEDULE_EVENT_FIELDS,
                            lang,
                        );

                        return originalJson.call(this, generalTranslatedData);
                    }

                    return originalJson.call(this, data);
                } catch (error) {
                    console.error('Error in response translation middleware:', error);
                    return originalJson.call(this, data);
                }
            })();

            return this;
        };
    }

    next();
}

/**
 * Main translation middleware yang menggabungkan POST dan response translation
 */
export const translationMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const acceptLanguage = req.headers['lang'] || ('en' as string);

        if (acceptLanguage === 'en') {
            return next();
        }

        // Handle POST request translation
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            await translatePostData(req, res, () => {});
        }

        // Handle response translation
        const originalSend = res.json;
        res.json = function (data: any) {
            (async () => {
                try {
                    if (data && typeof data === 'object') {
                        const endpoint = getEndpointFromPath(req.originalUrl);
                        const fieldsToTranslate = TRANSLATION_FIELD_MAPPING[endpoint];

                        if (fieldsToTranslate) {
                            const translatedData = await translateObjectFields(
                                data,
                                fieldsToTranslate,
                                acceptLanguage as string,
                            );

                            const nestedTranslatedData = await translateNestedFields(
                                translatedData,
                                [...fieldsToTranslate, ...SCHEDULE_EVENT_FIELDS],
                                acceptLanguage as string,
                            );

                            return originalSend.call(this, nestedTranslatedData);
                        }

                        const generalTranslatedData = await translateNestedFields(
                            data,
                            SCHEDULE_EVENT_FIELDS,
                            acceptLanguage as string,
                        );

                        return originalSend.call(this, generalTranslatedData);
                    }

                    return originalSend.call(this, data);
                } catch (error) {
                    console.error('Translation middleware error:', error);
                    return originalSend.call(this, data);
                }
            })();

            return this;
        };

        next();
    } catch (error) {
        console.error('Translation middleware setup error:', error);
        next();
    }
};

export default translationMiddleware;
export { translatePostData, translateResponseData };
