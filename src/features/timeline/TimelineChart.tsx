import { Alert, Paper, SegmentedControl, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { groupCallsByDay, groupCallsByHour } from '../../services/cdr/timelineAnalyzer';
import type { CDRRecord } from '../../types/cdr.types';

type TimelineChartProps = {
    records: CDRRecord[];
};

export function TimelineChart({ records }: TimelineChartProps) {
    const [mode, setMode] = useState<'day' | 'hour'>('day');

    const data = mode === 'day' ? groupCallsByDay(records) : groupCallsByHour(records);

    return (
        <Paper p="lg" radius="md" withBorder>
            <Stack gap="md">
                <div>
                    <Title order={3}>Timeline analysis</Title>
                    <Text c="dimmed" size="sm">
                        Track call volume by day or hour without leaving the browser.
                    </Text>
                </div>

                <SegmentedControl
                    data={[
                        { label: 'By day', value: 'day' },
                        { label: 'By hour', value: 'hour' },
                    ]}
                    onChange={(value) => setMode(value as 'day' | 'hour')}
                    value={mode}
                />

                {data.length === 0 ? (
                    <Alert color="blue">
                        Import records with valid timestamps to render timeline charts.
                    </Alert>
                ) : (
                    <div style={{ width: '100%', height: 360 }}>
                        <ResponsiveContainer>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis allowDecimals={false} />
                                <Tooltip formatter={(v) => [v, `Total Calls`]} />
                                <Line
                                    dataKey="callCount"
                                    stroke="#1c7ed6"
                                    strokeWidth={3}
                                    type="monotone"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Stack>
        </Paper>
    );
}
