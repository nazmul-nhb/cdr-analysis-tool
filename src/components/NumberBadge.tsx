import { Badge } from '@mantine/core';

import { isWatchlisted } from '../utils/formatters';

type NumberBadgeProps = {
    number: string;
    watchlist: string[];
    onClick?: (value: string) => void;
};

export function NumberBadge({ number, watchlist, onClick }: NumberBadgeProps) {
    const watched = isWatchlisted(number, watchlist);
    const isClickable = Boolean(onClick && number);

    return (
        <Badge
            color={watched ? 'orange' : 'blue'}
            onClick={() => {
                if (isClickable) {
                    onClick?.(number);
                }
            }}
            radius="sm"
            style={{ cursor: isClickable ? 'pointer' : 'default' }}
            variant={watched ? 'filled' : 'light'}
        >
            {number || 'Unknown'}
        </Badge>
    );
}
