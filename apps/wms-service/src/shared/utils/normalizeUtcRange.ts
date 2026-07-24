import { Op, WhereOptions } from 'sequelize';

export function normalizeUtcRange(
    startInput: string | Date,
    endInput: string | Date,
): WhereOptions {
    const start = startInput instanceof Date ? startInput : new Date(startInput);

    let end = endInput instanceof Date ? endInput : new Date(endInput);

    const isMidnight =
        end.getUTCHours() === 0 &&
        end.getUTCMinutes() === 0 &&
        end.getUTCSeconds() === 0 &&
        end.getUTCMilliseconds() === 0;

    if (isMidnight && end.getTime() === start.getTime()) {
        end = new Date(end);
        end.setUTCDate(end.getUTCDate() + 1);
    }

    return {
        [Op.gte]: start,
        [Op.lt]: end,
    } as any;
}
