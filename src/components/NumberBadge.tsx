import { ActionIcon, Badge, CopyButton, Flex } from '@mantine/core';
import { IconCopy, IconCopyCheck } from '@tabler/icons-react';
import { isWatchlisted } from '../utils/formatters';

type Props = {
    number: string;
    watchlist: string[];
    onClick?: (value: string) => void;
    copyButton?: boolean;
};

export function NumberBadge({ number, watchlist, onClick, copyButton = true }: Props) {
    const watched = isWatchlisted(number, watchlist);
    const isClickable = Boolean(onClick && number);

    return (
        <Flex align={'center'}>
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
            {copyButton && (
                <CopyButton timeout={2000} value={number}>
                    {({ copied, copy }) => {
                        return (
                            <ActionIcon
                                color={copied ? 'teal' : 'gray'}
                                onClick={copy}
                                variant="subtle"
                            >
                                {copied ? <IconCopyCheck size={12} /> : <IconCopy size={12} />}
                            </ActionIcon>
                        );
                    }}
                </CopyButton>
            )}
        </Flex>
    );
}
