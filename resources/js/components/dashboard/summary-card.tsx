import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { type HTMLAttributes } from 'react';

interface SummaryCardProps extends HTMLAttributes<HTMLDivElement> {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    href?: string;
    isLoading?: boolean;
}

export default function SummaryCard({
    title,
    value,
    icon: Icon,
    trend,
    href,
    isLoading = false,
    className,
    ...props
}: SummaryCardProps) {
    const cardContent = (
        <>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}
                {trend && !isLoading && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {trend.isPositive ? (
                            <TrendingUp className="size-3 text-green-600 dark:text-green-500" />
                        ) : (
                            <TrendingDown className="size-3 text-red-600 dark:text-red-500" />
                        )}
                        <span className={trend.isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}>
                            {trend.value}%
                        </span>
                        <span>dari bulan lalu</span>
                    </div>
                )}
            </CardContent>
        </>
    );

    if (href) {
        return (
            <a href={href} className="transition-opacity hover:opacity-80">
                <Card className={className} {...props}>
                    {cardContent}
                </Card>
            </a>
        );
    }

    return (
        <Card className={className} {...props}>
            {cardContent}
        </Card>
    );
}
