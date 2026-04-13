import { create } from 'zustand';

type RelationStore = {
    activeNumber: string | null;
    nestedRelations: string[];
    openRootRelation: (number: string) => void;
    openNestedRelation: (number: string) => void;
    closeRelationAtDepth: (depth: number) => void;
    closeAllRelations: () => void;
};

export const useRelationStore = create<RelationStore>((set) => ({
    activeNumber: null,
    nestedRelations: [],
    openRootRelation: (number) =>
        set({
            activeNumber: number,
            nestedRelations: [],
        }),
    openNestedRelation: (number) =>
        set((state) => {
            if (!state.activeNumber) {
                return {
                    activeNumber: number,
                    nestedRelations: [],
                };
            }

            return {
                nestedRelations: [...state.nestedRelations, number],
            };
        }),
    closeRelationAtDepth: (depth) =>
        set((state) => {
            if (depth <= 0) {
                return {
                    activeNumber: null,
                    nestedRelations: [],
                };
            }

            return {
                nestedRelations: state.nestedRelations.slice(0, Math.max(depth - 1, 0)),
            };
        }),
    closeAllRelations: () =>
        set({
            activeNumber: null,
            nestedRelations: [],
        }),
}));

export function selectRelationStack(
    activeNumber: string | null,
    nestedRelations: string[]
): string[] {
    return activeNumber ? [activeNumber, ...nestedRelations] : [];
}
