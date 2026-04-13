import * as XLSX from 'xlsx';

import type { CDRRecord, RelationMap } from '../../types/cdr.types';

function downloadWorkbook(workbook: XLSX.WorkBook, fileName: string): void {
    const buffer = XLSX.write(workbook, {
        type: 'array',
        bookType: 'xlsx',
    });
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    URL.revokeObjectURL(url);
}

export function exportRecordsToExcel(
    records: CDRRecord[],
    fileName = 'cdr-records.xlsx'
): void {
    const workbook = XLSX.utils.book_new();
    const rows = records.map((record) => ({
        id: record.id,
        aParty: record.aParty,
        bParty: record.bParty,
        dateTime: record.dateTime?.toISOString() ?? '',
        duration: record.duration ?? '',
        fileSource: record.fileSource,
        raw: JSON.stringify(record.raw),
    }));

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'records');

    downloadWorkbook(workbook, fileName);
}

export function exportRelationsToExcel(
    relations: RelationMap,
    fileName = 'cdr-relations.xlsx'
): void {
    const workbook = XLSX.utils.book_new();
    const rows = [...relations.entries()].flatMap(([aParty, contacts]) =>
        [...contacts.entries()].map(([bParty, stats]) => ({
            aParty,
            bParty,
            callCount: stats.callCount,
            totalDuration: stats.totalDuration,
            firstCall: stats.firstCall?.toISOString() ?? '',
            lastCall: stats.lastCall?.toISOString() ?? '',
        }))
    );

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'relations');

    downloadWorkbook(workbook, fileName);
}
