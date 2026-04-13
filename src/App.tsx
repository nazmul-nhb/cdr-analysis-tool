import { createTheme, MantineProvider, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { Notifications, notifications } from '@mantine/notifications';
import { Fragment, lazy, Suspense, startTransition, useState } from 'react';

import { AppShellLayout } from './components/layout/AppShellLayout';
import type { SidebarSection } from './components/layout/Sidebar';
import { CommonContactsDialog } from './features/common-contacts/CommonContactsDialog';
import { CDRTable } from './features/data-table/CDRTable';
import { FileImportPanel } from './features/file-import/FileImportPanel';
import { RelationDialog } from './features/relation/RelationDialog';
import { GlobalSearch } from './features/search/GlobalSearch';
import { WatchlistPanel } from './features/watchlist/WatchlistPanel';
import { selectUniqueNumbers, useCDRStore } from './store/cdr.store';
import { selectRelationStack, useRelationStore } from './store/relation.store';
import { useUIStore } from './store/ui.store';
import type { CDRRecord } from './types/cdr.types';

const theme = createTheme({
    primaryColor: 'blue',
    defaultRadius: 'md',
    fontFamily: 'Avenir Next, Segoe UI, sans-serif',
    headings: {
        fontFamily: 'Avenir Next, Segoe UI, sans-serif',
    },
});

const TimelineChart = lazy(async () => {
    const module = await import('./features/timeline/TimelineChart');
    return { default: module.TimelineChart };
});

const FrequencyChart = lazy(async () => {
    const module = await import('./features/frequency/FrequencyChart');
    return { default: module.FrequencyChart };
});

function SectionFallback() {
    return (
        <Paper p="lg" radius="md" withBorder>
            <Text c="dimmed" size="sm">
                Loading analysis view...
            </Text>
        </Paper>
    );
}

function App() {
    const [activeSection, setActiveSection] = useState<SidebarSection>('files');

    const {
        records,
        addImportedFiles,
        clearAllData,
        duplicates,
        files,
        relations,
        reverseRelations,
    } = useCDRStore();

    const {
        activeNumber,
        closeAllRelations,
        closeRelationAtDepth,
        nestedRelations,
        openNestedRelation,
        openRootRelation,
    } = useRelationStore();

    const {
        colorScheme,
        watchlist,
        dialogs,
        loading,
        toggleColorScheme,
        setDialogOpen,
        setLoading,
        addWatchNumber,
        removeWatchNumber,
        clearWatchlist,
    } = useUIStore();

    const uniqueNumbers = selectUniqueNumbers(records);
    const relationStack = selectRelationStack(activeNumber, nestedRelations);

    async function handleImport(filesToImport: File[]) {
        setLoading('importing', true);

        try {
            const { readExcelFiles } = await import('./services/excel/excelReader');
            const importedFiles = await readExcelFiles(filesToImport);

            startTransition(() => {
                addImportedFiles(importedFiles);
            });

            const totalRows = importedFiles.reduce((sum, file) => sum + file.rowCount, 0);
            const warnings = importedFiles.flatMap((file) => file.warnings);

            notifications.show({
                color: 'teal',
                title: 'Import complete',
                message: `${importedFiles.length} files loaded with ${totalRows} rows.`,
            });

            if (warnings.length > 0) {
                notifications.show({
                    color: 'yellow',
                    title: 'Import warnings',
                    message: warnings.join(' '),
                    autoClose: 7000,
                });
            }
        } catch (error) {
            notifications.show({
                color: 'red',
                title: 'Import failed',
                message: error instanceof Error ? error.message : 'Unknown import error.',
            });
        } finally {
            setLoading('importing', false);
        }
    }

    function handleClearData() {
        clearAllData();
        closeAllRelations();
        notifications.show({
            color: 'blue',
            title: 'Dataset cleared',
            message:
                'All imported files and derived analysis data have been removed from memory.',
        });
    }

    function handleFilteredChange(_records: CDRRecord[]) {}

    async function handleExportRecords(recordsToExport: CDRRecord[]) {
        setLoading('exporting', true);

        try {
            const { exportRecordsToExcel } = await import('./services/excel/excelWriter');
            exportRecordsToExcel(recordsToExport);
            notifications.show({
                color: 'teal',
                title: 'Records exported',
                message: `${recordsToExport.length} records were exported to Excel.`,
            });
        } catch (error) {
            notifications.show({
                color: 'red',
                title: 'Record export failed',
                message: error instanceof Error ? error.message : 'Unknown export error.',
            });
        } finally {
            setLoading('exporting', false);
        }
    }

    async function handleExportRelations() {
        setLoading('exporting', true);

        try {
            const { exportRelationsToExcel } = await import('./services/excel/excelWriter');
            exportRelationsToExcel(relations);
            notifications.show({
                color: 'teal',
                title: 'Relations exported',
                message: 'The relation map was exported to Excel.',
            });
        } catch (error) {
            notifications.show({
                color: 'red',
                title: 'Relation export failed',
                message: error instanceof Error ? error.message : 'Unknown export error.',
            });
        } finally {
            setLoading('exporting', false);
        }
    }

    const sharedProps = {
        watchlist,
        onOpenRelation: openRootRelation,
    };

    return (
        <MantineProvider forceColorScheme={colorScheme} theme={theme}>
            <Notifications position="top-right" />

            <AppShellLayout
                activeSection={activeSection}
                colorScheme={colorScheme}
                duplicateGroups={duplicates.length}
                onOpenCommonContacts={() => setDialogOpen('commonContacts', true)}
                onSectionChange={setActiveSection}
                onToggleColorScheme={toggleColorScheme}
                totalNumbers={uniqueNumbers.length}
                totalRecords={records.length}
            >
                <Stack gap="md">
                    {activeSection === 'files' && (
                        <Fragment>
                            <FileImportPanel
                                files={files}
                                isImporting={loading.importing}
                                onClear={handleClearData}
                                onImport={handleImport}
                            />
                            <CDRTable
                                duplicateGroups={duplicates.length}
                                isExporting={loading.exporting}
                                onExportRecords={handleExportRecords}
                                onExportRelations={handleExportRelations}
                                onFilteredChange={handleFilteredChange}
                                onOpenRelation={openRootRelation}
                                records={records}
                                watchlist={watchlist}
                            />
                        </Fragment>
                    )}

                    {activeSection === 'relations' && (
                        <SimpleGrid cols={{ base: 1, lg: 2 }}>
                            <GlobalSearch
                                records={records}
                                relations={relations}
                                reverseRelations={reverseRelations}
                                {...sharedProps}
                            />
                            <WatchlistPanel
                                onAdd={addWatchNumber}
                                onClear={clearWatchlist}
                                onOpenRelation={openRootRelation}
                                onRemove={removeWatchNumber}
                                records={records}
                                watchlist={watchlist}
                            />
                        </SimpleGrid>
                    )}

                    {activeSection === 'timeline' && (
                        <Suspense fallback={<SectionFallback />}>
                            <TimelineChart records={records} />
                        </Suspense>
                    )}

                    {activeSection === 'frequency' && (
                        <Suspense fallback={<SectionFallback />}>
                            <FrequencyChart relations={relations} />
                        </Suspense>
                    )}

                    {activeSection === 'watchlist' && (
                        <WatchlistPanel
                            onAdd={addWatchNumber}
                            onClear={clearWatchlist}
                            onOpenRelation={openRootRelation}
                            onRemove={removeWatchNumber}
                            records={records}
                            watchlist={watchlist}
                        />
                    )}
                </Stack>
            </AppShellLayout>

            <RelationDialog
                onCloseAtDepth={closeRelationAtDepth}
                onOpenNestedRelation={openNestedRelation}
                relations={relations}
                reverseRelations={reverseRelations}
                stack={relationStack}
                watchlist={watchlist}
            />

            <CommonContactsDialog
                numbers={uniqueNumbers}
                onClose={() => setDialogOpen('commonContacts', false)}
                onOpenRelation={openRootRelation}
                opened={dialogs.commonContacts}
                relations={relations}
                watchlist={watchlist}
            />
        </MantineProvider>
    );
}

export default App;
