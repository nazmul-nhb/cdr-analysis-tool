import type {
    CDRRecord,
    DetectedColumnMap,
    NormalizedFileResult,
    RawCDRRow,
} from '../../types/cdr.types';
import { detectColumns } from './columnDetector';

function toText(value: unknown): string {
    if (value == null) {
        return '';
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    return String(value).trim();
}

function cleanPhoneNumber(value: unknown): string {
    const digitsOnly = toText(value).replace(/[^\d]/g, '');
    return digitsOnly;
}

function parseTimeValue(
    value: unknown
): { hours: number; minutes: number; seconds: number } | null {
    if (value == null || value === '') {
        return null;
    }

    if (value instanceof Date) {
        return {
            hours: value.getHours(),
            minutes: value.getMinutes(),
            seconds: value.getSeconds(),
        };
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        if (value >= 0 && value < 1) {
            const totalSeconds = Math.round(value * 24 * 60 * 60);
            return {
                hours: Math.floor(totalSeconds / 3600) % 24,
                minutes: Math.floor((totalSeconds % 3600) / 60),
                seconds: totalSeconds % 60,
            };
        }
    }

    const text = toText(value);
    const match = text.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i);

    if (!match) {
        return null;
    }

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = Number(match[3] ?? 0);
    const meridiem = match[4]?.toLowerCase();

    if (meridiem === 'pm' && hours < 12) {
        hours += 12;
    }

    if (meridiem === 'am' && hours === 12) {
        hours = 0;
    }

    return { hours, minutes, seconds };
}

function excelSerialToDate(serial: number): Date {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const milliseconds = serial * 24 * 60 * 60 * 1000;
    return new Date(excelEpoch.getTime() + milliseconds);
}

function parseLooseDateString(text: string): Date | null {
    const normalized = text.trim();
    if (!normalized) {
        return null;
    }

    const nativeParsed = new Date(normalized);
    if (!Number.isNaN(nativeParsed.getTime())) {
        return nativeParsed;
    }

    const match = normalized.match(
        /^(\d{1,4})[./-](\d{1,2})[./-](\d{1,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?)?$/i
    );

    if (!match) {
        return null;
    }

    let year = Number(match[1]);
    let month = Number(match[2]);
    let day = Number(match[3]);

    if (match[1].length !== 4) {
        year = Number(match[3]);

        if (Number(match[2]) > 12) {
            month = Number(match[1]);
            day = Number(match[2]);
        } else {
            day = Number(match[1]);
            month = Number(match[2]);
        }
    }

    let hours = Number(match[4] ?? 0);
    const minutes = Number(match[5] ?? 0);
    const seconds = Number(match[6] ?? 0);
    const meridiem = match[7]?.toLowerCase();

    if (meridiem === 'pm' && hours < 12) {
        hours += 12;
    }

    if (meridiem === 'am' && hours === 12) {
        hours = 0;
    }

    const date = new Date(year, Math.max(month - 1, 0), day, hours, minutes, seconds);
    return Number.isNaN(date.getTime()) ? null : date;
}

function parseDateValue(value: unknown): Date | null {
    if (value == null || value === '') {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        if (value > 1_000_000_000_000) {
            const epochDate = new Date(value);
            if (!Number.isNaN(epochDate.getTime())) {
                return epochDate;
            }
        }

        if (value > 1_000_000_000) {
            const epochSecondsDate = new Date(value * 1000);
            if (!Number.isNaN(epochSecondsDate.getTime())) {
                return epochSecondsDate;
            }
        }

        return excelSerialToDate(value);
    }

    return parseLooseDateString(toText(value));
}

function mergeDateTime(dateValue: unknown, timeValue: unknown): Date | null {
    const date = parseDateValue(dateValue);
    const time = parseTimeValue(timeValue);

    if (date && time) {
        date.setHours(time.hours, time.minutes, time.seconds, 0);
        return date;
    }

    if (date) {
        return date;
    }

    return parseDateValue(timeValue);
}

function parseDuration(value: unknown): number | null {
    if (value == null || value === '') {
        return null;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        if (value > 0 && value < 1) {
            return Math.round(value * 24 * 60 * 60);
        }

        return Math.round(value);
    }

    const text = toText(value);
    const durationMatch = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (durationMatch) {
        const hours = Number(durationMatch[1]);
        const minutes = Number(durationMatch[2]);
        const seconds = Number(durationMatch[3] ?? 0);
        return hours * 3600 + minutes * 60 + seconds;
    }

    const numeric = Number(text.replace(/[^\d.]/g, ''));
    return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric) : null;
}

function buildRecordId(
    fileSource: string,
    index: number,
    aParty: string,
    bParty: string,
    dateTime: Date | null
): string {
    return [
        fileSource,
        index,
        aParty || 'na',
        bParty || 'na',
        dateTime?.toISOString() ?? 'no-date',
    ].join('::');
}

function normalizeRow(
    row: RawCDRRow,
    rowIndex: number,
    fileSource: string,
    mapping: DetectedColumnMap
): CDRRecord {
    const aParty = cleanPhoneNumber(mapping.aParty ? row[mapping.aParty] : '');
    const bParty = cleanPhoneNumber(mapping.bParty ? row[mapping.bParty] : '');
    const dateTime = mapping.dateTime
        ? parseDateValue(row[mapping.dateTime])
        : mergeDateTime(
              mapping.date ? row[mapping.date] : undefined,
              mapping.time ? row[mapping.time] : undefined
          );
    const duration = parseDuration(mapping.duration ? row[mapping.duration] : null);

    return {
        id: buildRecordId(fileSource, rowIndex, aParty, bParty, dateTime),
        aParty,
        bParty,
        dateTime,
        duration,
        fileSource,
        raw: row,
    };
}

export function normalizeCDRRows(rows: RawCDRRow[], fileSource: string): NormalizedFileResult {
    const mapping = detectColumns(rows);
    const warnings: string[] = [];

    if (!mapping.aParty) {
        warnings.push(`A-party column was not confidently detected in ${fileSource}.`);
    }

    if (!mapping.bParty) {
        warnings.push(`B-party column was not confidently detected in ${fileSource}.`);
    }

    const meaningfulRows = rows.filter((row) =>
        Object.values(row).some((value) => toText(value).length > 0)
    );

    const records = meaningfulRows.map((row, index) =>
        normalizeRow(row, index, fileSource, mapping)
    );

    return {
        fileName: fileSource,
        rowCount: rows.length,
        records,
        mapping,
        warnings,
    };
}
