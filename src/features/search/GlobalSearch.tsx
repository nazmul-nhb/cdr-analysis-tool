import {
    Alert,
    Badge,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useDeferredValue, useState } from 'react';

import { NumberBadge } from '../../components/NumberBadge';
import type { CDRRecord, RelationMap, ReverseRelationMap } from '../../types/cdr.types';
import { formatDateTime, formatDuration, sanitizePhoneNumber } from '../../utils/formatters';

type GlobalSearchProps = {
    records: CDRRecord[];
    relations: RelationMap;
    reverseRelations: ReverseRelationMap;
    watchlist: string[];
    onOpenRelation: (number: string) => void;
};

export function GlobalSearch({
    records,
    relations,
    reverseRelations,
    watchlist,
    onOpenRelation,
}: GlobalSearchProps) {
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query);
    const normalizedQuery = sanitizePhoneNumber(deferredQuery);

    const matchingRecords = normalizedQuery
        ? records
              .filter(
                  (record) =>
                      record.aParty.includes(normalizedQuery) ||
                      record.bParty.includes(normalizedQuery)
              )
              .slice(0, 20)
        : [];

    const outgoingRelations = normalizedQuery ? relations.get(normalizedQuery) : undefined;
    const incomingRelations = normalizedQuery
        ? reverseRelations.get(normalizedQuery)
        : undefined;

    return (
        <Paper p="lg" radius="md" withBorder>
            <Stack gap="md">
                <div>
                    <Title order={3}>Global search</Title>
                    <Text c="dimmed" size="sm">
                        Search by phone number and jump into matching records or relation paths.
                    </Text>
                </div>

                <TextInput
                    leftSection={<IconSearch size={16} />}
                    onChange={(event) => setQuery(event.currentTarget.value)}
                    placeholder="Type a phone number"
                    value={query}
                />

                {!normalizedQuery ? (
                    <Alert color="blue">
                        Search results appear here once you enter a number.
                    </Alert>
                ) : (
                    <Stack gap="md">
                        <Group gap="xs">
                            <Badge color="blue" variant="light">
                                {matchingRecords.length} matching records
                            </Badge>
                            <Badge color="teal" variant="light">
                                {outgoingRelations?.size ?? 0} outgoing relations
                            </Badge>
                            <Badge color="orange" variant="light">
                                {incomingRelations?.size ?? 0} incoming relations
                            </Badge>
                        </Group>

                        <Group gap="sm">
                            <NumberBadge
                                number={normalizedQuery}
                                onClick={onOpenRelation}
                                watchlist={watchlist}
                            />
                            <Text c="dimmed" size="sm">
                                Click the matched number badge to open the relation explorer.
                            </Text>
                        </Group>

                        <SimpleGrid cols={{ base: 1, xl: 2 }}>
                            {matchingRecords.map((record) => (
                                <Paper key={record.id} p="md" radius="md" withBorder>
                                    <Stack gap="xs">
                                        <Group gap="xs">
                                            <NumberBadge
                                                number={record.aParty}
                                                onClick={onOpenRelation}
                                                watchlist={watchlist}
                                            />
                                            <Text c="dimmed" size="sm">
                                                to
                                            </Text>
                                            <NumberBadge
                                                number={record.bParty}
                                                onClick={onOpenRelation}
                                                watchlist={watchlist}
                                            />
                                        </Group>
                                        <Text size="sm">{formatDateTime(record.dateTime)}</Text>
                                        <Text c="dimmed" size="sm">
                                            {formatDuration(record.duration)} •{' '}
                                            {record.fileSource}
                                        </Text>
                                    </Stack>
                                </Paper>
                            ))}
                        </SimpleGrid>
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}
