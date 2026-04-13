import type { CommonContactMatch, RelationMap } from '../../types/cdr.types';

export function findCommonContacts(
    leftNumber: string,
    rightNumber: string,
    relations: RelationMap
): CommonContactMatch[] {
    const leftContacts = relations.get(leftNumber) ?? new Map();
    const rightContacts = relations.get(rightNumber) ?? new Map();

    const [smaller, other, isLeftSmaller] =
        leftContacts.size <= rightContacts.size
            ? [leftContacts, rightContacts, true]
            : [rightContacts, leftContacts, false];

    const matches: CommonContactMatch[] = [];

    for (const [contact, stats] of smaller) {
        const matchingStats = other.get(contact);
        if (!matchingStats) {
            continue;
        }

        matches.push({
            number: contact,
            leftStats: isLeftSmaller ? stats : matchingStats,
            rightStats: isLeftSmaller ? matchingStats : stats,
            combinedCallCount: stats.callCount + matchingStats.callCount,
            combinedDuration: stats.totalDuration + matchingStats.totalDuration,
        });
    }

    return matches.sort(
        (left, right) =>
            right.combinedCallCount - left.combinedCallCount ||
            right.combinedDuration - left.combinedDuration
    );
}
