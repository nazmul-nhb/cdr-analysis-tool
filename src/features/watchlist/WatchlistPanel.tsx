import { Alert, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

import { NumberBadge } from '../../components/NumberBadge';
import type { CDRRecord } from '../../types/cdr.types';
import { sanitizePhoneNumber } from '../../utils/formatters';

type WatchlistPanelProps = {
    records: CDRRecord[];
    watchlist: string[];
    onAdd: (number: string) => void;
    onRemove: (number: string) => void;
    onClear: () => void;
    onOpenRelation: (number: string) => void;
};

export function WatchlistPanel({
    records,
    watchlist,
    onAdd,
    onRemove,
    onClear,
    onOpenRelation,
}: WatchlistPanelProps) {
    const [draftNumber, setDraftNumber] = useState('');

    const hitCounts = watchlist.map((number) => ({
        number,
        hits: records.filter((record) => record.aParty === number || record.bParty === number)
            .length,
    }));

    function handleAdd() {
        const normalized = sanitizePhoneNumber(draftNumber);
        if (!normalized) {
            return;
        }

        onAdd(normalized);
        setDraftNumber('');
    }

    return (
        <Paper p="lg" radius="md" withBorder>
            <Stack gap="md">
                <div>
                    <Title order={3}>Watchlist</Title>
                    <Text c="dimmed" size="sm">
                        Add priority numbers and they will stay visually highlighted across the
                        app.
                    </Text>
                </div>

                <Group align="flex-end">
                    <TextInput
                        label="Add number"
                        onChange={(event) => setDraftNumber(event.currentTarget.value)}
                        placeholder="Enter phone number"
                        style={{ flex: 1 }}
                        value={draftNumber}
                    />
                    <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
                        Add
                    </Button>
                    <Button
                        bg={watchlist.length ? 'red' : 'gray'}
                        disabled={watchlist.length === 0}
                        leftSection={<IconTrash size={16} />}
                        onClick={onClear}
                        variant="default"
                    >
                        Clear
                    </Button>
                </Group>

                {watchlist.length === 0 ? (
                    <Alert color="blue">No numbers are being watched yet.</Alert>
                ) : (
                    <Stack gap="sm">
                        {hitCounts.map((entry) => (
                            <Paper key={entry.number} p="md" radius="md" withBorder>
                                <Group align="center" justify="space-between" wrap="wrap">
                                    <Stack gap={4}>
                                        <NumberBadge
                                            number={entry.number}
                                            onClick={onOpenRelation}
                                            watchlist={watchlist}
                                        />
                                        <Text c="dimmed" size="sm">
                                            {entry.hits} matching records in the current dataset
                                        </Text>
                                    </Stack>
                                    <Button
                                        color="red"
                                        onClick={() => onRemove(entry.number)}
                                        variant="light"
                                    >
                                        Remove
                                    </Button>
                                </Group>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}
