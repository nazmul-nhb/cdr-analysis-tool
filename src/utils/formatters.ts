import { formatDate } from 'nhb-toolbox';

export function sanitizePhoneNumber(value: string): string {
    return value.split(/\s/)[0];
}

export function formatDuration(value: number | null): string {
    if (value == null) {
        return 'Unknown';
    }

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
}

export function formatDateTime(value: Date | null): string {
    if (!value) {
        return 'Unknown';
    }

    return formatDate({ date: value, format: 'DD-MM-YYYY hh:mm:ss a' });
}

export function formatCompactNumber(value: number): string {
    return new Intl.NumberFormat(undefined, {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
}

export function isWatchlisted(number: string, watchlist: string[]): boolean {
    return watchlist.includes(sanitizePhoneNumber(number));
}
