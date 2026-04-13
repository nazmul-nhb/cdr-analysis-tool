import { Alert, Paper, Stack, Text, Title } from '@mantine/core';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { getTopContactedNumbers } from '../../services/cdr/frequencyAnalyzer';
import type { RelationMap } from '../../types/cdr.types';

type FrequencyChartProps = {
    relations: RelationMap;
};

export function FrequencyChart({ relations }: FrequencyChartProps) {
    const data = getTopContactedNumbers(relations, 12);

    return (
        <Paper p="lg" radius="md" withBorder>
            <Stack gap="md">
                <div>
                    <Title order={3}>Frequency analysis</Title>
                    <Text c="dimmed" size="sm">
                        Surface the most contacted numbers based on aggregated call counts.
                    </Text>
                </div>

                {data.length === 0 ? (
                    <Alert color="blue">
                        Import records to calculate the top contacted numbers.
                    </Alert>
                ) : (
                    <div style={{ width: '100%', height: 420 }}>
                        <ResponsiveContainer>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="number" hide />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="callCount" fill="#0ca678" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Stack>
        </Paper>
    );
}
