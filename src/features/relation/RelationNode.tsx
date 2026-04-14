import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import { formatWithPlural } from 'nhb-toolbox';
import { NumberBadge } from '../../components/NumberBadge';
import type { RelationStats } from '../../types/cdr.types';
import { formatDuration } from '../../utils/formatters';

type RelationNodeProps = {
    number: string;
    stats: RelationStats;
    hasNestedRelations: boolean;
    watchlist: string[];
    onOpenRelation: (number: string) => void;
};

export function RelationNode({
    number,
    stats,
    hasNestedRelations,
    watchlist,
    onOpenRelation,
}: RelationNodeProps) {
    return (
        <Paper p="md" radius="md" withBorder>
            <Group align="center" justify="space-between" wrap="wrap">
                <Stack gap={4}>
                    <NumberBadge
                        number={number}
                        onClick={onOpenRelation}
                        watchlist={watchlist}
                    />
                    <Text c="dimmed" size="sm">
                        {formatWithPlural(stats.callCount, 'call')} •{' '}
                        {formatDuration(stats.totalDuration)}
                    </Text>
                </Stack>

                <Button
                    disabled={!hasNestedRelations}
                    onClick={() => onOpenRelation(number)}
                    variant="gradient"
                >
                    Explore nested
                </Button>
            </Group>
        </Paper>
    );
}
