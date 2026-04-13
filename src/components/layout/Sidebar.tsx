import { NavLink, Stack } from '@mantine/core';
import {
    IconChartBar,
    IconChartLine,
    IconFiles,
    IconRadar2,
    IconStar,
} from '@tabler/icons-react';

export type SidebarSection = 'files' | 'relations' | 'timeline' | 'frequency' | 'watchlist';

type SidebarProps = {
    activeSection: SidebarSection;
    onSectionChange: (section: SidebarSection) => void;
};

const SIDEBAR_ITEMS: Array<{
    section: SidebarSection;
    label: string;
    icon: typeof IconFiles;
}> = [
    { section: 'files', label: 'Files', icon: IconFiles },
    { section: 'relations', label: 'Relations', icon: IconRadar2 },
    { section: 'timeline', label: 'Timeline', icon: IconChartLine },
    { section: 'frequency', label: 'Frequency', icon: IconChartBar },
    { section: 'watchlist', label: 'Watchlist', icon: IconStar },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
    return (
        <Stack gap="xs">
            {SIDEBAR_ITEMS.map((item) => (
                <NavLink
                    active={activeSection === item.section}
                    key={item.section}
                    label={item.label}
                    leftSection={<item.icon size={18} stroke={1.8} />}
                    onClick={() => onSectionChange(item.section)}
                    variant="filled"
                />
            ))}
        </Stack>
    );
}
