import type { CDRRecord, RelationMap, RelationStats } from '../../types/cdr.types';

function createRelationStats(): RelationStats {
    return {
        callCount: 0,
        totalDuration: 0,
        firstCall: null,
        lastCall: null,
    };
}

function updateRelationStats(stats: RelationStats, record: CDRRecord): void {
    stats.callCount += 1;
    stats.totalDuration += record.duration ?? 0;

    if (record.dateTime) {
        if (!stats.firstCall || record.dateTime < stats.firstCall) {
            stats.firstCall = record.dateTime;
        }

        if (!stats.lastCall || record.dateTime > stats.lastCall) {
            stats.lastCall = record.dateTime;
        }
    }
}

export function buildRelationMap(records: CDRRecord[]): RelationMap {
    const relations: RelationMap = new Map();

    for (const record of records) {
        if (!record.aParty || !record.bParty) {
            continue;
        }

        let contacts = relations.get(record.aParty);
        if (!contacts) {
            contacts = new Map();
            relations.set(record.aParty, contacts);
        }

        let stats = contacts.get(record.bParty);
        if (!stats) {
            stats = createRelationStats();
            contacts.set(record.bParty, stats);
        }

        updateRelationStats(stats, record);
    }

    return relations;
}
