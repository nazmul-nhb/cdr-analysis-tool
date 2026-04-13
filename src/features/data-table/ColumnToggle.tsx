import { Button, Checkbox, Menu, Stack } from '@mantine/core';
import { IconColumns3 } from '@tabler/icons-react';
import type { Column } from '@tanstack/react-table';

import type { CDRRecord } from '../../types/cdr.types';

type ColumnToggleProps = {
    columns: Array<Column<CDRRecord, unknown>>;
};

export function ColumnToggle({ columns }: ColumnToggleProps) {
    const toggleableColumns = columns.filter((column) => column.getCanHide());

    return (
        <Menu position="bottom-end" shadow="md" width={220}>
            <Menu.Target>
                <Button leftSection={<IconColumns3 size={16} />} variant="default">
                    Columns
                </Button>
            </Menu.Target>

            <Menu.Dropdown>
                <Stack gap={4} p="xs">
                    {toggleableColumns.map((column) => (
                        <Checkbox
                            checked={column.getIsVisible()}
                            key={column.id}
                            label={String(column.columnDef.header)}
                            onChange={column.getToggleVisibilityHandler()}
                        />
                    ))}
                </Stack>
            </Menu.Dropdown>
        </Menu>
    );
}
