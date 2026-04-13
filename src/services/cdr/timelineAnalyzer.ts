import type { CDRRecord, TimelineBucket } from '../../types/cdr.types';

function sortBuckets(buckets: Map<string, TimelineBucket>): TimelineBucket[] {
    return [...buckets.values()].sort((left, right) => left.label.localeCompare(right.label));
}

export function groupCallsByDay(records: CDRRecord[]): TimelineBucket[] {
    const buckets = new Map<string, TimelineBucket>();

    for (const record of records) {
        if (!record.dateTime) {
            continue;
        }

        const label = record.dateTime.toISOString().slice(0, 10);
        const current = buckets.get(label) ?? {
            label,
            callCount: 0,
            totalDuration: 0,
        };

        current.callCount += 1;
        current.totalDuration += record.duration ?? 0;
        buckets.set(label, current);
    }

    return sortBuckets(buckets);
}

export function groupCallsByHour(records: CDRRecord[]): TimelineBucket[] {
    const buckets = new Map<string, TimelineBucket>();

    for (const record of records) {
        if (!record.dateTime) {
            continue;
        }

        const hour = String(record.dateTime.getHours()).padStart(2, '0');
        const label = `${hour}:00`;
        const current = buckets.get(label) ?? {
            label,
            callCount: 0,
            totalDuration: 0,
        };

        current.callCount += 1;
        current.totalDuration += record.duration ?? 0;
        buckets.set(label, current);
    }

    return sortBuckets(buckets);
}
