import {
    Alert,
    Group,
    Pagination,
    Paper,
    ScrollArea,
    Stack,
    Table,
    Text,
    Title,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import { NumberBadge } from '../../components/NumberBadge';
import type { CDRRecord } from '../../types/cdr.types';
import { formatDateTime, formatDuration, sanitizePhoneNumber } from '../../utils/formatters';
import { ColumnToggle } from './ColumnToggle';
import { TableFilters } from './TableFilters';

type CDRTableProps = {
    records: CDRRecord[];
    watchlist: string[];
    duplicateGroups: number;
    isExporting: boolean;
    onOpenRelation: (number: string) => void;
    onFilteredChange: (records: CDRRecord[]) => void;
    onExportRecords: (records: CDRRecord[]) => void | Promise<void>;
    onExportRelations: () => void | Promise<void>;
};

export function CDRTable({
    records,
    watchlist,
    duplicateGroups,
    isExporting,
    onOpenRelation,
    onFilteredChange,
    onExportRecords,
    onExportRelations,
}: CDRTableProps) {
    const [sorting, setSorting] = useState<SortingState>([{ id: 'dateTime', desc: true }]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const columns: ColumnDef<CDRRecord>[] = [
        {
            accessorKey: 'aParty',
            header: 'A Party',
            cell: ({ row }) => (
                <NumberBadge
                    number={row.original.aParty}
                    onClick={onOpenRelation}
                    watchlist={watchlist}
                />
            ),
        },
        {
            accessorKey: 'bParty',
            header: 'B Party',
            cell: ({ row }) => (
                <NumberBadge
                    number={row.original.bParty}
                    onClick={onOpenRelation}
                    watchlist={watchlist}
                />
            ),
        },
        {
            accessorKey: 'dateTime',
            header: 'Date / Time',
            cell: ({ row }) => formatDateTime(row.original.dateTime),
            sortingFn: (left, right) => {
                const leftTime = left.original.dateTime?.getTime() ?? 0;
                const rightTime = right.original.dateTime?.getTime() ?? 0;
                return leftTime - rightTime;
            },
        },
        {
            accessorKey: 'duration',
            header: 'Duration',
            cell: ({ row }) => formatDuration(row.original.duration),
            sortingFn: (left, right) =>
                (left.original.duration ?? 0) - (right.original.duration ?? 0),
        },
        {
            accessorKey: 'fileSource',
            header: 'Source file',
            cell: ({ row }) => row.original.fileSource,
        },
    ];

    const table = useReactTable({
        data: records,
        columns,
        state: {
            sorting,
            globalFilter,
            columnVisibility,
        },
        initialState: {
            pagination: {
                pageSize: 12,
            },
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        globalFilterFn: (row, __, filterValue) => {
            const freeText = String(filterValue).toLowerCase().trim();
            const numberQuery = sanitizePhoneNumber(freeText);

            return (
                row.original.aParty.includes(numberQuery) ||
                row.original.bParty.includes(numberQuery) ||
                row.original.fileSource.toLowerCase().includes(freeText) ||
                formatDateTime(row.original.dateTime).toLowerCase().includes(freeText)
            );
        },
    });

    const filteredRecords = table.getFilteredRowModel().rows.map((row) => row.original);
    const filteredSignature = filteredRecords.map((record) => record.id).join('|');

    useEffect(() => {
        onFilteredChange(filteredRecords);
    }, [filteredSignature, onFilteredChange]);

    if (records.length === 0) {
        return (
            <Paper p="lg" radius="md" withBorder>
                <Alert color="blue" icon={<IconInfoCircle size={16} />}>
                    Import files to populate the analysis table.
                </Alert>
            </Paper>
        );
    }

    return (
        <Paper p="lg" radius="md" withBorder>
            <Stack gap="md">
                <Group align="flex-start" justify="space-between">
                    <div>
                        <Title order={3}>Normalized records</Title>
                        <Text c="dimmed" size="sm">
                            Sort, filter, paginate, and jump straight into relation analysis by
                            clicking a number.
                        </Text>
                    </div>
                </Group>

                <TableFilters
                    columnToggle={<ColumnToggle columns={table.getAllLeafColumns()} />}
                    duplicateGroups={duplicateGroups}
                    filteredCount={filteredRecords.length}
                    isExporting={isExporting}
                    onExportRecords={() => onExportRecords(filteredRecords)}
                    onExportRelations={onExportRelations}
                    onQueryChange={setGlobalFilter}
                    query={globalFilter}
                    totalCount={records.length}
                />

                <ScrollArea>
                    <Table highlightOnHover striped withColumnBorders withTableBorder>
                        <Table.Thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <Table.Tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <Table.Th
                                            key={header.id}
                                            onClick={header.column.getToggleSortingHandler()}
                                            style={{
                                                cursor: header.column.getCanSort()
                                                    ? 'pointer'
                                                    : 'default',
                                            }}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef.header,
                                                      header.getContext()
                                                  )}
                                        </Table.Th>
                                    ))}
                                </Table.Tr>
                            ))}
                        </Table.Thead>

                        <Table.Tbody>
                            {table.getRowModel().rows.map((row) => (
                                <Table.Tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <Table.Td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </Table.Td>
                                    ))}
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>

                <Group align="center" justify="space-between">
                    <Text c="dimmed" size="sm">
                        Page {table.getState().pagination.pageIndex + 1} of{' '}
                        {Math.max(table.getPageCount(), 1)}
                    </Text>
                    <Pagination
                        onChange={(page) => table.setPageIndex(page - 1)}
                        total={Math.max(table.getPageCount(), 1)}
                        value={table.getState().pagination.pageIndex + 1}
                    />
                </Group>
            </Stack>
        </Paper>
    );
}
