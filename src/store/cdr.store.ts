import { naturalSort } from 'nhb-toolbox';
import { create } from 'zustand';
import { normalizeCDRRows } from '../services/cdr/cdrNormalizer';
import { detectDuplicateRecords } from '../services/cdr/duplicateDetector';
import { buildRelationMap } from '../services/cdr/relationEngine';
import { buildReverseRelationMap } from '../services/cdr/reverseRelation';
import type {
    CDRRecord,
    DuplicateGroup,
    ImportedExcelFile,
    ImportedFileSummary,
    RelationMap,
    ReverseRelationMap,
} from '../types/cdr.types';

type CDRStore = {
    records: CDRRecord[];
    relations: RelationMap;
    reverseRelations: ReverseRelationMap;
    files: ImportedFileSummary[];
    duplicates: DuplicateGroup[];
    addImportedFiles: (importedFiles: ImportedExcelFile[]) => void;
    clearAllData: () => void;
};

function buildSummaries(
    importedFiles: ImportedExcelFile[],
    normalizedFiles: ReturnType<typeof normalizeCDRRows>[]
): ImportedFileSummary[] {
    return importedFiles.map((file, index) => {
        const normalized = normalizedFiles[index];
        return {
            name: file.fileName,
            rowCount: file.rowCount,
            normalizedCount: normalized?.records.length ?? 0,
            sheetCount: file.sheetCount,
            warnings: [...file.warnings, ...(normalized?.warnings ?? [])],
        };
    });
}

export const useCDRStore = create<CDRStore>((set) => ({
    records: [],
    relations: new Map(),
    reverseRelations: new Map(),
    files: [],
    duplicates: [],
    addImportedFiles: (importedFiles) =>
        set((state) => {
            const normalizedFiles = importedFiles.map((file) =>
                normalizeCDRRows(file.rows, file.fileName)
            );
            const nextRecords = [
                ...state.records,
                ...normalizedFiles.flatMap((file) => file.records),
            ];
            const nextRelations = buildRelationMap(nextRecords);
            const nextReverseRelations = buildReverseRelationMap(nextRelations);

            return {
                records: nextRecords,
                relations: nextRelations,
                reverseRelations: nextReverseRelations,
                duplicates: detectDuplicateRecords(nextRecords),
                files: [...state.files, ...buildSummaries(importedFiles, normalizedFiles)],
            };
        }),
    clearAllData: () =>
        set({
            records: [],
            relations: new Map(),
            reverseRelations: new Map(),
            files: [],
            duplicates: [],
        }),
}));

export function selectUniqueNumbers(records: CDRRecord[]): string[] {
    const numbers = new Set<string>();

    for (const record of records) {
        if (record.aParty) {
            numbers.add(record.aParty);
        }

        if (record.bParty) {
            numbers.add(record.bParty);
        }
    }

    return [...numbers].sort((left, right) => naturalSort(left, right, { localeAware: true }));
}
