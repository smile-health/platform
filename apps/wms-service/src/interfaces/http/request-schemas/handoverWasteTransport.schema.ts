import { z } from 'zod';

const handoverTransportWasteSchemaBody = z.object({
    wasteTransportationGroupId: z.preprocess(
        (val) => {
            try {
                if (typeof val !== 'string') {
                    return [val];
                }

                const parsed = JSON.parse(val);

                if (Array.isArray(parsed)) {
                    const numberArray = parsed.map((item) => {
                        const num = Number(item);
                        return isNaN(num) ? item : num;
                    });
                    return numberArray;
                }

                return parsed;
            } catch (error) {
                const num = Number(val);
                return isNaN(num) ? val : num;
            }
        },
        z
            .array(
                z.number().min(1, { message: 'wasteTransportationGroupId is required' }).optional(),
            )
            .optional(),
    ),
    wasteTransportationExternalGroupId: z.preprocess(
        (val) => {
            try {
                if (typeof val !== 'string') {
                    return val;
                }

                const parsed = JSON.parse(val);

                if (Array.isArray(parsed)) {
                    const numberArray = parsed.map((item) => {
                        const num = Number(item);
                        return isNaN(num) ? item : num;
                    });
                    return numberArray;
                }

                return parsed;
            } catch (error) {
                const num = Number(val);
                return isNaN(num) ? val : num;
            }
        },
        z
            .array(
                z.number().min(1, { message: 'wasteTransportationGroupId is required' }).optional(),
            )
            .optional(),
    ),
    handoverLattitude: z.preprocess(
        (val) => {
            if (typeof val === 'string') {
                const parsed = Number.parseFloat(val);
                return isNaN(parsed) ? undefined : parsed;
            }
            return val;
        },
        z.number({ message: 'handoverLattitude must be a number' }).optional(),
    ),
    handoverLongitude: z.preprocess(
        (val) => {
            if (typeof val === 'string') {
                const parsed = Number.parseFloat(val);
                return isNaN(parsed) ? undefined : parsed;
            }
            return val;
        },
        z.number({ message: 'handoverLongitude must be a number' }).optional(),
    ),
    vehicleNumber: z.preprocess(
        (val) => {
            if (typeof val === 'string') {
                return val;
            }
            return val;
        },
        z.string({ message: 'vehicleNumber must be a string' }).optional(),
    ),
    manifestDocNumber: z.preprocess(
        (val) => {
            if (typeof val === 'string') {
                return val;
            }
            return val;
        },
        z.string({ message: 'manifestDocNumber must be a string' }).optional(),
    ),
    transporterVehicleId: z
        .number({ message: 'transporterVehicleId is required' })
        .int()
        .positive({ message: 'transporterVehicleId must be a positive integer' })
        .optional(),
    transporterOperatorId: z.string({ message: 'transporterOperatorId is required' }).optional(),
    startTime: z.preprocess(
        (val) => {
            if (typeof val === 'string' || typeof val === 'number') {
                const date = new Date(val);
                return isNaN(date.getTime()) ? undefined : date;
            }
            return val;
        },
        z.date({
            message: 'treatmentStartTime must be a valid date',
        }),
    ),
    handoverTimestamp: z.preprocess(
        (val) => {
            if (typeof val === 'string' || typeof val === 'number') {
                const date = new Date(val);
                return isNaN(date.getTime()) ? undefined : date;
            }
            return val;
        },
        z.date({
            message: 'treatmentEndTime must be a valid date',
        }),
    ),
    treatmentProviderId: z
        .number({ message: 'treatmentProviderId is required' })
        .int()
        .positive({ message: 'treatmentProviderId must be a positive integer' })
        .optional(),
    treatmentOperatorId: z.string({ message: 'treatmentOperatorId is required' }).optional(),
    wasteBagQrCodeIds: z
        .array(z.string({ message: 'wasteBagQrCodeIds is required' }).optional())
        .optional(),
    isReadOnly: z.preprocess(
        (val) => {
            if (typeof val === 'string') {
                if (val === 'true') {
                    return true;
                }
                return false;
            }
        },
        z
            .boolean({
                message: 'isReadOnly must be a valid boolean',
            })
            .default(false)
            .optional(),
    ),
});

export const handoverTransportWasteSchema = z.object({
    body: handoverTransportWasteSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
