import { ActionIcon, Badge, Button, Group, TextInput } from '@mantine/core';
import { IconCopyX, IconDownload, IconFileSpreadsheet, IconSearch } from '@tabler/icons-react';
import type { ReactNode } from 'react';

type TableFiltersProps = {
    query: string;
    onQueryChange: (value: string) => void;
    filteredCount: number;
    totalCount: number;
    duplicateGroups: number;
    isExporting: boolean;
    onExportRecords: () => void | Promise<void>;
    onExportRelations: () => void | Promise<void>;
    columnToggle: ReactNode;
};

export function TableFilters({
    query,
    onQueryChange,
    filteredCount,
    totalCount,
    duplicateGroups,
    isExporting,
    onExportRecords,
    onExportRelations,
    columnToggle,
}: TableFiltersProps) {
    return (
        <Group align="flex-end" justify="space-between" wrap="wrap">
            <TextInput
                label="Search records"
                leftSection={<IconSearch size={16} />}
                onChange={(event) => onQueryChange(event.currentTarget.value)}
                placeholder="Filter by number, date, or source file"
                rightSection={
                    query ? (
                        <ActionIcon
                            onClick={() => onQueryChange('')}
                            size="sm"
                            variant="subtle"
                        >
                            <IconCopyX size={16} />
                        </ActionIcon>
                    ) : null
                }
                style={{ flex: 1, minWidth: 280 }}
                value={query}
            />

            <Group align="flex-end" gap="sm" wrap="wrap">
                <Badge color="blue" variant="light">
                    {filteredCount} / {totalCount} visible
                </Badge>
                <Badge color="orange" variant="light">
                    {duplicateGroups} duplicate groups
                </Badge>
                {columnToggle}
                <Button
                    disabled={filteredCount === 0}
                    leftSection={<IconFileSpreadsheet size={16} />}
                    loading={isExporting}
                    onClick={onExportRecords}
                    variant="default"
                >
                    Export records
                </Button>
                <Button
                    disabled={totalCount === 0}
                    leftSection={<IconDownload size={16} />}
                    loading={isExporting}
                    onClick={onExportRelations}
                >
                    Export relations
                </Button>
            </Group>
        </Group>
    );
}
