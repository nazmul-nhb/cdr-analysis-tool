import * as XLSX from 'xlsx';

import type { ImportedExcelFile, RawCDRRow } from '../../types/cdr.types';

const SUPPORTED_EXTENSIONS = new Set(['xls', 'xlsx', 'csv']);

function getExtension(fileName: string): string {
    const parts = fileName.toLowerCase().split('.');
    return parts.at(-1) ?? '';
}

function sanitizeRows(rows: RawCDRRow[]): RawCDRRow[] {
    return rows.filter((row) =>
        Object.values(row).some((value) => String(value ?? '').trim().length > 0)
    );
}

function readSheetRows(sheet: XLSX.WorkSheet): RawCDRRow[] {
    try {
        return sanitizeRows(
            XLSX.utils.sheet_to_json<RawCDRRow>(sheet, {
                defval: null,
                raw: false,
            })
        );
    } catch {
        return [];
    }
}

export async function readExcelFile(file: File): Promise<ImportedExcelFile> {
    const warnings: string[] = [];
    const extension = getExtension(file.name);

    if (!SUPPORTED_EXTENSIONS.has(extension)) {
        warnings.push(`Unsupported file extension for ${file.name}.`);
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, {
        type: 'array',
        cellDates: true,
        dense: false,
    });

    const rows = workbook.SheetNames.flatMap((sheetName) => {
        const sheet = workbook.Sheets[sheetName];

        if (!sheet) {
            warnings.push(`Sheet "${sheetName}" could not be read in ${file.name}.`);
            return [];
        }

        return readSheetRows(sheet);
    });

    if (rows.length === 0) {
        warnings.push(`No tabular rows were detected in ${file.name}.`);
    }

    return {
        fileName: file.name,
        rows,
        rowCount: rows.length,
        sheetCount: workbook.SheetNames.length,
        warnings,
    };
}

export async function readExcelFiles(files: File[]): Promise<ImportedExcelFile[]> {
    const settled = await Promise.allSettled(files.map((file) => readExcelFile(file)));

    return settled.flatMap((result, index) => {
        if (result.status === 'fulfilled') {
            return result.value;
        }

        return {
            fileName: files[index]?.name ?? `file-${index + 1}`,
            rows: [],
            rowCount: 0,
            sheetCount: 0,
            warnings: [
                result.reason instanceof Error
                    ? result.reason.message
                    : 'Unknown import error.',
            ],
        };
    });
}
