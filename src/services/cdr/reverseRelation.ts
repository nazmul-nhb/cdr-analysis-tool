import type { RelationMap, ReverseRelationMap } from '../../types/cdr.types';

export function buildReverseRelationMap(relations: RelationMap): ReverseRelationMap {
    const reverseMap: ReverseRelationMap = new Map();

    for (const [aParty, contacts] of relations) {
        for (const [bParty, stats] of contacts) {
            let parents = reverseMap.get(bParty);
            if (!parents) {
                parents = new Map();
                reverseMap.set(bParty, parents);
            }

            parents.set(aParty, { ...stats });
        }
    }

    return reverseMap;
}
