import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type HTMLAttributes } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface StatsChartProps extends HTMLAttributes<HTMLDivElement> {
    type: 'line' | 'bar';
    title: string;
    data: Array<Record<string, string | number>>;
    dataKey: string;
    xAxisKey: string;
    isLoading?: boolean;
}

export default function StatsChart({
    type,
    title,
    data,
    dataKey,
    xAxisKey,
    isLoading = false,
    className,
    ...props
}: StatsChartProps) {
    return (
        <Card className={className} {...props}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        {type === 'line' ? (
                            <LineChart data={data}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-muted"
                                />
                                <XAxis dataKey={xAxisKey} className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '0.5rem',
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey={dataKey}
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    dot={{ fill: 'hsl(var(--primary))' }}
                                />
                            </LineChart>
                        ) : (
                            <BarChart data={data}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-muted"
                                />
                                <XAxis dataKey={xAxisKey} className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '0.5rem',
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey={dataKey}
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
