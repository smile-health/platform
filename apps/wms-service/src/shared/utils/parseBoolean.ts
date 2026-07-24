// src/utils/boolean.ts

export type BooleanInput = boolean | number | string | null | undefined;

const TRUE_SET = new Set(['1', 'true', 'yes', 'y', 'on']);
const FALSE_SET = new Set(['0', 'false', 'no', 'n', 'off']);

export function parseBoolean(input?: BooleanInput): boolean | undefined {
    if (input == null) return undefined;
    if (typeof input === 'boolean') return input;
    if (typeof input === 'number') return input === 1;

    if (typeof input === 'string') {
        const s = input.trim().toLowerCase();
        if (TRUE_SET.has(s)) return true;
        if (FALSE_SET.has(s)) return false;
    }

    return undefined;
}

export function mustBoolean(input: BooleanInput, fieldName = 'isRead'): boolean {
    const v = parseBoolean(input);
    if (v === undefined) {
        throw new Error(`Invalid ${fieldName}: expected boolean (true|false atau 1|0).`);
    }
    return v;
}

export function isTruthyString(s: string): boolean {
    return TRUE_SET.has(s.trim().toLowerCase());
}
export function isFalsyString(s: string): boolean {
    return FALSE_SET.has(s.trim().toLowerCase());
}
