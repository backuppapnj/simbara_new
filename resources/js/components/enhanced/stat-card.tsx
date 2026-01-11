import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label?: string;
    };
    status?: 'success' | 'warning' | 'error' | 'neutral';
    href?: string;
    isLoading?: boolean;
    error?: string;
    className?: string;
    onClick?: () => void;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    status = 'neutral',
    href,
    isLoading = false,
    error,
    className,
    onClick,
}: StatCardProps) {
    // Determine trend direction and styling
    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend.value > 0) return <TrendingUp className="size-3" />;
        if (trend.value < 0) return <TrendingDown className="size-3" />;
        return <Minus className="size-3" />;
    };

    const getTrendColor = () => {
        if (!trend) return 'text-muted-foreground';
        if (trend.value > 0) return 'text-green-600 dark:text-green-500';
        if (trend.value < 0) return 'text-red-600 dark:text-red-500';
        return 'text-muted-foreground';
    };

    const getTrendBgColor = () => {
        if (!trend) return 'bg-muted/50';
        if (trend.value > 0) return 'bg-green-50 dark:bg-green-950/20';
        if (trend.value < 0) return 'bg-red-50 dark:bg-red-950/20';
        return 'bg-muted/50';
    };

    // Get status badge
    const getStatusBadge = () => {
        if (status === 'neutral') return null;
        const variants = {
            success: { label: 'Baik', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
            warning: { label: 'Perhatian', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
            error: { label: 'Kritis', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
        };
        const variant = variants[status];
        return <Badge className={variant.className}>{variant.label}</Badge>;
    };

    const cardContent = (
        <>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="flex items-center gap-2">
                    {getStatusBadge()}
                    <div className="rounded-lg bg-muted/50 p-2">
                        <Icon className="size-4 text-muted-foreground" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                ) : error ? (
                    <Alert variant="destructive" className="py-2">
                        <AlertCircle className="size-4" />
                        <AlertDescription className="text-xs">{error}</AlertDescription>
                    </Alert>
                ) : (
                    <>
                        <div className="text-2xl font-bold tracking-tight">{value}</div>
                        {trend && (
                            <div
                                className={cn(
                                    'mt-2 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium',
                                    getTrendColor(),
                                    getTrendBgColor()
                                )}
                            >
                                {getTrendIcon()}
                                <span>{Math.abs(trend.value)}%</span>
                                <span className="text-muted-foreground">
                                    {trend.label || 'dari bulan lalu'}
                                </span>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </>
    );

    const cardClassName = cn(
        'transition-all duration-200',
        (href || onClick) && 'cursor-pointer hover:shadow-md hover:border-primary/50',
        className
    );

    if (href) {
        return (
            <a href={href} className="block">
                <Card className={cardClassName}>{cardContent}</Card>
            </a>
        );
    }

    if (onClick) {
        return (
            <Card className={cardClassName} onClick={onClick}>
                {cardContent}
            </Card>
        );
    }

    return <Card className={cardClassName}>{cardContent}</Card>;
}
