import { Alert, Stack } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

import type { RelationMap } from '../../types/cdr.types';
import { RelationNode } from './RelationNode';

type RelationTreeProps = {
    number: string;
    relations: RelationMap;
    watchlist: string[];
    onOpenRelation: (number: string) => void;
};

export function RelationTree({
    number,
    relations,
    watchlist,
    onOpenRelation,
}: RelationTreeProps) {
    const directRelations = [...(relations.get(number)?.entries() ?? [])].sort(
        (left, right) =>
            right[1].callCount - left[1].callCount ||
            right[1].totalDuration - left[1].totalDuration
    );

    if (directRelations.length === 0) {
        return (
            <Alert color="gray" icon={<IconInfoCircle size={16} />}>
                No outgoing relations were found for this number. If it only appears as a
                B-party, the nested view stays empty instead of failing.
            </Alert>
        );
    }

    return (
        <Stack gap="sm">
            {directRelations.map(([relatedNumber, stats]) => (
                <RelationNode
                    hasNestedRelations={relations.has(relatedNumber)}
                    key={`${number}-${relatedNumber}`}
                    number={relatedNumber}
                    onOpenRelation={onOpenRelation}
                    stats={stats}
                    watchlist={watchlist}
                />
            ))}
        </Stack>
    );
}
