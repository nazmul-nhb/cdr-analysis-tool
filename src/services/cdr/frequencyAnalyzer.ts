import type { FrequencyEntry, RelationMap } from '../../types/cdr.types';

export function getTopContactedNumbers(relations: RelationMap, limit = 10): FrequencyEntry[] {
    const frequencyMap = new Map<
        string,
        { callCount: number; totalDuration: number; callers: Set<string> }
    >();

    for (const [aParty, contacts] of relations) {
        for (const [bParty, stats] of contacts) {
            let entry = frequencyMap.get(bParty);
            if (!entry) {
                entry = {
                    callCount: 0,
                    totalDuration: 0,
                    callers: new Set(),
                };
                frequencyMap.set(bParty, entry);
            }

            entry.callCount += stats.callCount;
            entry.totalDuration += stats.totalDuration;
            entry.callers.add(aParty);
        }
    }

    return [...frequencyMap.entries()]
        .map(([number, stats]) => ({
            number,
            callCount: stats.callCount,
            totalDuration: stats.totalDuration,
            uniqueCallers: stats.callers.size,
        }))
        .sort(
            (left, right) =>
                right.callCount - left.callCount || right.totalDuration - left.totalDuration
        )
        .slice(0, limit);
}
