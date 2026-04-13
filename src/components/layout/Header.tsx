import { ActionIcon, Badge, Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconMoonStars, IconSunHigh, IconUsers } from '@tabler/icons-react';

import { formatCompactNumber } from '../../utils/formatters';

type HeaderProps = {
    totalRecords: number;
    totalNumbers: number;
    duplicateGroups: number;
    colorScheme: 'light' | 'dark';
    onToggleColorScheme: () => void;
    onOpenCommonContacts: () => void;
};

export function Header({
    totalRecords,
    totalNumbers,
    duplicateGroups,
    colorScheme,
    onToggleColorScheme,
    onOpenCommonContacts,
}: HeaderProps) {
    return (
        <Group align="center" justify="space-between" wrap="nowrap">
            <Stack gap={2}>
                <Title order={2}>CDR Analysis Tool</Title>
                <Text c="dimmed" size="sm">
                    Client-side Excel normalization, relation mapping, search, charting, and
                    export.
                </Text>
            </Stack>

            <Group gap="sm" justify="flex-end" wrap="wrap">
                <Badge color="blue" variant="light">
                    {formatCompactNumber(totalRecords)} records
                </Badge>
                <Badge color="teal" variant="light">
                    {formatCompactNumber(totalNumbers)} numbers
                </Badge>
                <Badge color="orange" variant="light">
                    {duplicateGroups} duplicate groups
                </Badge>
                <Button
                    leftSection={<IconUsers size={16} />}
                    onClick={onOpenCommonContacts}
                    variant="light"
                >
                    Common contacts
                </Button>
                <ActionIcon
                    aria-label="Toggle color scheme"
                    color={colorScheme === 'dark' ? 'yellow' : 'blue'}
                    onClick={onToggleColorScheme}
                    size="lg"
                    variant="light"
                >
                    {colorScheme === 'dark' ? (
                        <IconSunHigh size={18} />
                    ) : (
                        <IconMoonStars size={18} />
                    )}
                </ActionIcon>
            </Group>
        </Group>
    );
}
