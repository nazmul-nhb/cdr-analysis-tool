import { AppShell, Box, ScrollArea } from '@mantine/core';
import type { ReactNode } from 'react';

import { Header } from './Header';
import { Sidebar, type SidebarSection } from './Sidebar';

type AppShellLayoutProps = {
    activeSection: SidebarSection;
    onSectionChange: (section: SidebarSection) => void;
    totalRecords: number;
    totalNumbers: number;
    duplicateGroups: number;
    colorScheme: 'light' | 'dark';
    onToggleColorScheme: () => void;
    onOpenCommonContacts: () => void;
    children: ReactNode;
};

export function AppShellLayout({
    activeSection,
    onSectionChange,
    totalRecords,
    totalNumbers,
    duplicateGroups,
    colorScheme,
    onToggleColorScheme,
    onOpenCommonContacts,
    children,
}: AppShellLayoutProps) {
    return (
        <AppShell
            header={{ height: 88 }}
            navbar={{ width: 240, breakpoint: 'sm' }}
            padding="md"
        >
            <AppShell.Header p="md">
                <Header
                    colorScheme={colorScheme}
                    duplicateGroups={duplicateGroups}
                    onOpenCommonContacts={onOpenCommonContacts}
                    onToggleColorScheme={onToggleColorScheme}
                    totalNumbers={totalNumbers}
                    totalRecords={totalRecords}
                />
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <Sidebar activeSection={activeSection} onSectionChange={onSectionChange} />
            </AppShell.Navbar>

            <AppShell.Main>
                <ScrollArea offsetScrollbars scrollbarSize={8}>
                    <Box pb="xl">{children}</Box>
                </ScrollArea>
            </AppShell.Main>
        </AppShell>
    );
}
