export type RawCDRRow = Record<string, unknown>;

export type CDRRecord = {
    id: string;
    aParty: string;
    bParty: string;
    dateTime: Date | null;
    duration: number | null;
    fileSource: string;
    raw: RawCDRRow;
};

export type RelationStats = {
    callCount: number;
    totalDuration: number;
    firstCall: Date | null;
    lastCall: Date | null;
};

export type DetectedColumnMap = {
    aParty?: string;
    bParty?: string;
    date?: string;
    time?: string;
    dateTime?: string;
    duration?: string;
};

export type ImportedExcelFile = {
    fileName: string;
    rows: RawCDRRow[];
    rowCount: number;
    sheetNames: string[];
    sheetCount: number;
    warnings: string[];
};

export type ImportedFileSummary = {
    name: string;
    rowCount: number;
    normalizedCount: number;
    sheetCount: number;
    warnings: string[];
};

export type NormalizedFileResult = {
    fileName: string;
    rowCount: number;
    records: CDRRecord[];
    mapping: DetectedColumnMap;
    warnings: string[];
};

export type RelationMap = Map<string, Map<string, RelationStats>>;

export type ReverseRelationMap = Map<string, Map<string, RelationStats>>;

export type RelationNodeData = {
    number: string;
    stats: RelationStats;
    hasNestedRelations: boolean;
};

export type CommonContactMatch = {
    number: string;
    leftStats: RelationStats;
    rightStats: RelationStats;
    combinedCallCount: number;
    combinedDuration: number;
};

export type FrequencyEntry = {
    number: string;
    callCount: number;
    totalDuration: number;
    uniqueCallers: number;
};

export type TimelineBucket = {
    label: string;
    callCount: number;
    totalDuration: number;
};

export type DuplicateGroup = {
    fingerprint: string;
    records: CDRRecord[];
};
