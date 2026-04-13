import {
    Alert,
    Badge,
    Button,
    FileInput,
    Group,
    Paper,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { IconAlertCircle, IconFileImport, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

import type { ImportedFileSummary } from '../../types/cdr.types';

type FileImportPanelProps = {
    files: ImportedFileSummary[];
    isImporting: boolean;
    onImport: (files: File[]) => Promise<void>;
    onClear: () => void;
};

export function FileImportPanel({
    files,
    isImporting,
    onImport,
    onClear,
}: FileImportPanelProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    async function handleImport() {
        if (selectedFiles.length === 0) {
            return;
        }

        await onImport(selectedFiles);
        setSelectedFiles([]);
    }

    return (
        <Paper p="lg" radius="md" withBorder>
            <Stack gap="md">
                <Group align="flex-start" justify="space-between">
                    <div>
                        <Title order={3}>File import</Title>
                        <Text c="dimmed" size="sm">
                            Load multiple `.xls`, `.xlsx`, or `.csv` files
                        </Text>
                    </div>

                    <Group gap="sm">
                        <Button
                            bg={files.length ? 'red' : 'gray'}
                            disabled={files.length === 0}
                            leftSection={<IconTrash size={16} />}
                            onClick={onClear}
                            variant="default"
                        >
                            Clear dataset
                        </Button>
                        <Button
                            disabled={selectedFiles.length === 0}
                            leftSection={<IconFileImport size={16} />}
                            loading={isImporting}
                            onClick={handleImport}
                        >
                            Import files
                        </Button>
                    </Group>
                </Group>

                <FileInput
                    accept=".xls,.xlsx,.csv"
                    clearable
                    label="Excel sources"
                    multiple
                    onChange={(value) =>
                        setSelectedFiles(Array.isArray(value) ? value : value ? [value] : [])
                    }
                    placeholder="Choose one or more CDR files"
                    value={selectedFiles}
                />

                <Stack gap="sm">
                    {files.length === 0 ? (
                        <Alert color="blue" icon={<IconAlertCircle size={16} />}>
                            No files imported yet. Start by loading one or more telecom record
                            files.
                        </Alert>
                    ) : (
                        files.map((file) => (
                            <Paper
                                key={`${file.name}-${file.rowCount}`}
                                p="md"
                                radius="md"
                                withBorder
                            >
                                <Stack gap="xs">
                                    <Group align="center" justify="space-between">
                                        <Text fw={600}>{file.name}</Text>
                                        <Group gap="xs">
                                            <Badge color="blue" variant="light">
                                                {file.rowCount} rows
                                            </Badge>
                                            <Badge color="teal" variant="light">
                                                {file.normalizedCount} normalized
                                            </Badge>
                                            <Badge color="gray" variant="light">
                                                {file.sheetCount} sheets
                                            </Badge>
                                        </Group>
                                    </Group>

                                    {file.warnings.length > 0 && (
                                        <Alert
                                            color="yellow"
                                            icon={<IconAlertCircle size={16} />}
                                        >
                                            {file.warnings.join(' ')}
                                        </Alert>
                                    )}
                                </Stack>
                            </Paper>
                        ))
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
}
