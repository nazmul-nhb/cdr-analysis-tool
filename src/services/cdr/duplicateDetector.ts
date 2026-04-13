import type { CDRRecord, DuplicateGroup } from '../../types/cdr.types';

function buildFingerprint(record: CDRRecord): string {
    return [
        record.aParty,
        record.bParty,
        record.dateTime?.toISOString() ?? 'no-date',
        record.duration ?? 'no-duration',
    ].join('|');
}

export function detectDuplicateRecords(records: CDRRecord[]): DuplicateGroup[] {
    const groups = new Map<string, CDRRecord[]>();

    for (const record of records) {
        const fingerprint = buildFingerprint(record);
        const existing = groups.get(fingerprint);

        if (existing) {
            existing.push(record);
            continue;
        }

        groups.set(fingerprint, [record]);
    }

    return [...groups.entries()]
        .filter(([, duplicates]) => duplicates.length > 1)
        .map(([fingerprint, duplicates]) => ({
            fingerprint,
            records: duplicates,
        }))
        .sort((left, right) => right.records.length - left.records.length);
}
