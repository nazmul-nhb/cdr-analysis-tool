import type { DetectedColumnMap, RawCDRRow } from '../../types/cdr.types';

const COLUMN_ALIASES = {
    aParty: [
        'aparty',
        'a party',
        'calling',
        'caller',
        'calling number',
        'calling no',
        'caller number',
        'originating',
        'from',
        'source',
        'ani',
    ],
    bParty: [
        'bparty',
        'b party',
        'called',
        'receiver',
        'receiving',
        'destination',
        'to',
        'target',
        'dnis',
        'called number',
        'receiver number',
    ],
    dateTime: [
        'datetime',
        'date time',
        'call datetime',
        'call date time',
        'timestamp',
        'call timestamp',
        'event time',
    ],
    date: ['date', 'call date', 'event date', 'transaction date'],
    time: ['time', 'call time', 'event time', 'transaction time'],
    duration: ['duration', 'call duration', 'seconds', 'sec', 'bill duration'],
} as const;

function normalizeHeader(value: string): string {
    return value
        .toLowerCase()
        .replace(/[_-]+/g, ' ')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tokenize(value: string): string[] {
    return normalizeHeader(value).split(' ').filter(Boolean);
}

function scoreHeader(header: string, aliases: readonly string[]): number {
    const normalizedHeader = normalizeHeader(header);
    const headerTokens = tokenize(header);
    let bestScore = 0;

    for (const alias of aliases) {
        const normalizedAlias = normalizeHeader(alias);
        const aliasTokens = tokenize(alias);

        if (!normalizedHeader || !normalizedAlias) {
            continue;
        }

        if (normalizedHeader === normalizedAlias) {
            bestScore = Math.max(bestScore, 100);
            continue;
        }

        if (
            normalizedHeader.includes(normalizedAlias) ||
            normalizedAlias.includes(normalizedHeader)
        ) {
            bestScore = Math.max(bestScore, 92);
        }

        const tokenHits = aliasTokens.filter((token) => headerTokens.includes(token)).length;
        if (tokenHits > 0) {
            const tokenScore = Math.round((tokenHits / aliasTokens.length) * 80);
            bestScore = Math.max(bestScore, tokenScore);
        }

        if (normalizedHeader.replace(/\s+/g, '') === normalizedAlias.replace(/\s+/g, '')) {
            bestScore = Math.max(bestScore, 96);
        }
    }

    return bestScore;
}

function collectHeaders(rows: RawCDRRow[]): string[] {
    const headerSet = new Set<string>();

    for (const row of rows) {
        for (const key of Object.keys(row)) {
            if (key.trim()) {
                headerSet.add(key);
            }
        }
    }

    return [...headerSet];
}

function findBestHeader(
    headers: string[],
    aliases: readonly string[],
    usedHeaders: Set<string>
): string | undefined {
    let bestHeader: string | undefined;
    let bestScore = 0;

    for (const header of headers) {
        if (usedHeaders.has(header)) {
            continue;
        }

        const score = scoreHeader(header, aliases);
        if (score > bestScore) {
            bestHeader = header;
            bestScore = score;
        }
    }

    if (bestScore < 45) {
        return undefined;
    }

    return bestHeader;
}

export function detectColumns(rows: RawCDRRow[]): DetectedColumnMap {
    const headers = collectHeaders(rows);
    const usedHeaders = new Set<string>();
    const mapping: DetectedColumnMap = {};

    if (headers.length === 0) {
        return mapping;
    }

    const dateTimeHeader = findBestHeader(headers, COLUMN_ALIASES.dateTime, usedHeaders);
    if (dateTimeHeader) {
        mapping.dateTime = dateTimeHeader;
        usedHeaders.add(dateTimeHeader);
    }

    const aPartyHeader = findBestHeader(headers, COLUMN_ALIASES.aParty, usedHeaders);
    if (aPartyHeader) {
        mapping.aParty = aPartyHeader;
        usedHeaders.add(aPartyHeader);
    }

    const bPartyHeader = findBestHeader(headers, COLUMN_ALIASES.bParty, usedHeaders);
    if (bPartyHeader) {
        mapping.bParty = bPartyHeader;
        usedHeaders.add(bPartyHeader);
    }

    const durationHeader = findBestHeader(headers, COLUMN_ALIASES.duration, usedHeaders);
    if (durationHeader) {
        mapping.duration = durationHeader;
        usedHeaders.add(durationHeader);
    }

    if (!mapping.dateTime) {
        const dateHeader = findBestHeader(headers, COLUMN_ALIASES.date, usedHeaders);
        if (dateHeader) {
            mapping.date = dateHeader;
            usedHeaders.add(dateHeader);
        }

        const timeHeader = findBestHeader(headers, COLUMN_ALIASES.time, usedHeaders);
        if (timeHeader) {
            mapping.time = timeHeader;
            usedHeaders.add(timeHeader);
        }
    }

    return mapping;
}
