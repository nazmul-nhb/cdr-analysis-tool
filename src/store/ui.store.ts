import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sanitizePhoneNumber } from '../utils/formatters';

type DialogState = {
    commonContacts: boolean;
};

type LoadingState = {
    importing: boolean;
    exporting: boolean;
};

type UIStore = {
    dialogs: DialogState;
    loading: LoadingState;
    colorScheme: 'light' | 'dark';
    watchlist: string[];
    setDialogOpen: (dialog: keyof DialogState, isOpen: boolean) => void;
    setLoading: (key: keyof LoadingState, isLoading: boolean) => void;
    toggleColorScheme: () => void;
    addWatchNumber: (number: string) => void;
    removeWatchNumber: (number: string) => void;
    clearWatchlist: () => void;
};

export const useUIStore = create<UIStore>()(
    persist(
        (set) => ({
            dialogs: {
                commonContacts: false,
            },
            loading: {
                importing: false,
                exporting: false,
            },
            colorScheme: 'dark',
            watchlist: [],
            setDialogOpen: (dialog, isOpen) =>
                set((state) => ({
                    dialogs: {
                        ...state.dialogs,
                        [dialog]: isOpen,
                    },
                })),
            setLoading: (key, isLoading) =>
                set((state) => ({
                    loading: {
                        ...state.loading,
                        [key]: isLoading,
                    },
                })),
            toggleColorScheme: () =>
                set((state) => ({
                    colorScheme: state.colorScheme === 'dark' ? 'light' : 'dark',
                })),
            addWatchNumber: (number) =>
                set((state) => {
                    const normalized = sanitizePhoneNumber(number);

                    if (!normalized || state.watchlist.includes(normalized)) {
                        return state;
                    }

                    return {
                        watchlist: [...state.watchlist, normalized],
                    };
                }),
            removeWatchNumber: (number) =>
                set((state) => ({
                    watchlist: state.watchlist.filter(
                        (item) => item !== sanitizePhoneNumber(number)
                    ),
                })),
            clearWatchlist: () =>
                set({
                    watchlist: [],
                }),
        }),
        {
            name: 'cdr-ui-store',
            partialize: (state) => ({
                colorScheme: state.colorScheme,
                watchlist: state.watchlist,
            }),
        }
    )
);
