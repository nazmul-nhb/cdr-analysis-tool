import { Badge, Group, Modal, Stack, Text } from '@mantine/core';
import { Fragment } from 'react/jsx-runtime';
import type { RelationMap, ReverseRelationMap } from '../../types/cdr.types';
import { RelationTree } from './RelationTree';

type RelationDialogProps = {
    stack: string[];
    relations: RelationMap;
    reverseRelations: ReverseRelationMap;
    watchlist: string[];
    onOpenNestedRelation: (number: string) => void;
    onCloseAtDepth: (depth: number) => void;
};

export function RelationDialog({
    stack,
    relations,
    reverseRelations,
    watchlist,
    onOpenNestedRelation,
    onCloseAtDepth,
}: RelationDialogProps) {
    return (
        <Fragment>
            {stack.map((number, depth) => {
                const outgoingCount = relations.get(number)?.size ?? 0;
                const incomingCount = reverseRelations.get(number)?.size ?? 0;

                return (
                    <Modal
                        centered={depth === 0}
                        key={`${number}-${depth}`}
                        onClose={() => onCloseAtDepth(depth)}
                        opened
                        size="lg"
                        title={`Relation explorer • ${number}`}
                        zIndex={300 + depth * 10}
                    >
                        <Stack gap="md">
                            <Group gap="xs">
                                <Badge color="blue" variant="light">
                                    {outgoingCount} outgoing contacts
                                </Badge>
                                <Badge color="teal" variant="light">
                                    {incomingCount} incoming parents
                                </Badge>
                                <Badge color="gray" variant="light">
                                    depth {depth + 1}
                                </Badge>
                            </Group>

                            <Text c="dimmed" size="sm">
                                Click any related number to open another nested relation layer.
                                Missing deeper data stays empty by design.
                            </Text>

                            <RelationTree
                                number={number}
                                onOpenRelation={onOpenNestedRelation}
                                relations={relations}
                                watchlist={watchlist}
                            />
                        </Stack>
                    </Modal>
                );
            })}
        </Fragment>
    );
}
