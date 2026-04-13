import { Alert, Group, Modal, Paper, Select, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';

import { NumberBadge } from '../../components/NumberBadge';
import { findCommonContacts } from '../../services/cdr/commonContacts';
import type { RelationMap } from '../../types/cdr.types';
import { formatDuration } from '../../utils/formatters';

type CommonContactsDialogProps = {
    opened: boolean;
    numbers: string[];
    relations: RelationMap;
    watchlist: string[];
    onOpenRelation: (number: string) => void;
    onClose: () => void;
};

export function CommonContactsDialog({
    opened,
    numbers,
    relations,
    watchlist,
    onOpenRelation,
    onClose,
}: CommonContactsDialogProps) {
    const [leftNumber, setLeftNumber] = useState<string | null>(null);
    const [rightNumber, setRightNumber] = useState<string | null>(null);

    const matches =
        leftNumber && rightNumber && leftNumber !== rightNumber
            ? findCommonContacts(leftNumber, rightNumber, relations)
            : [];

    const selectOptions = numbers.map((number) => ({
        value: number,
        label: number,
    }));

    return (
        <Modal centered onClose={onClose} opened={opened} size="lg" title="Common contacts">
            <Stack gap="md">
                <Text c="dimmed" size="sm">
                    Compare two numbers and surface the shared contacts they both connect with.
                </Text>

                <Group grow>
                    <Select
                        data={selectOptions}
                        label="Number A"
                        onChange={setLeftNumber}
                        searchable
                        value={leftNumber}
                    />
                    <Select
                        data={selectOptions}
                        label="Number B"
                        onChange={setRightNumber}
                        searchable
                        value={rightNumber}
                    />
                </Group>

                {!leftNumber || !rightNumber ? (
                    <Alert color="blue">Pick two numbers to calculate shared contacts.</Alert>
                ) : leftNumber === rightNumber ? (
                    <Alert color="yellow">Choose two different numbers for comparison.</Alert>
                ) : matches.length === 0 ? (
                    <Alert color="gray">No shared contacts were found for this pair.</Alert>
                ) : (
                    <Stack gap="sm">
                        <Title order={4}>Shared contacts</Title>
                        {matches.map((match) => (
                            <Paper key={match.number} p="md" radius="md" withBorder>
                                <Stack gap="xs">
                                    <NumberBadge
                                        number={match.number}
                                        onClick={onOpenRelation}
                                        watchlist={watchlist}
                                    />
                                    <Text size="sm">
                                        {match.combinedCallCount} combined calls •{' '}
                                        {formatDuration(match.combinedDuration)}
                                    </Text>
                                    <Text c="dimmed" size="sm">
                                        Left: {match.leftStats.callCount} calls | Right:{' '}
                                        {match.rightStats.callCount} calls
                                    </Text>
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Modal>
    );
}
