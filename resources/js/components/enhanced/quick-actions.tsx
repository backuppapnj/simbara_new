import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

export interface QuickAction {
    id: string;
    label: string;
    icon: LucideIcon;
    href?: string;
    onClick?: () => void;
    badge?: string | number;
    description?: string;
    disabled?: boolean;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export interface QuickActionsProps {
    title?: string;
    description?: string;
    actions: QuickAction[];
    isLoading?: boolean;
    columns?: 2 | 3 | 4;
    className?: string;
}

const variantStyles = {
    default: 'hover:bg-accent hover:text-accent-foreground border-border',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary/20',
    success: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
    danger: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800',
};

export function QuickActions({
    title = 'Aksi Cepat',
    description,
    actions,
    isLoading = false,
    columns = 4,
    className,
}: QuickActionsProps) {
    const gridCols = {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };

    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </CardHeader>
                <CardContent>
                    <div className={cn('grid gap-4', gridCols[columns])}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </CardHeader>
            <CardContent>
                <div className={cn('grid gap-4', gridCols[columns])}>
                    {actions.map((action) => {
                        const Icon = action.icon;
                        const buttonContent = (
                            <>
                                <div className="flex items-start justify-between w-full">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={cn(
                                                'rounded-md p-2 transition-colors',
                                                action.variant === 'primary'
                                                    ? 'bg-primary/20 text-primary-foreground'
                                                    : 'bg-muted'
                                            )}
                                        >
                                            <Icon className="size-5" />
                                        </div>
                                        <div className="flex-1 text-left space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{action.label}</span>
                                                {action.badge && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {action.badge}
                                                    </Badge>
                                                )}
                                            </div>
                                            {action.description && (
                                                <p className="text-xs text-muted-foreground">
                                                    {action.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        );

                        if (action.href) {
                            return (
                                <a
                                    key={action.id}
                                    href={action.href}
                                    className={cn(
                                        'group relative flex items-center gap-3 rounded-lg border p-4 transition-all duration-200',
                                        variantStyles[action.variant || 'default'],
                                        action.disabled &&
                                            'pointer-events-none opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    {buttonContent}
                                </a>
                            );
                        }

                        return (
                            <Button
                                key={action.id}
                                variant="outline"
                                className={cn(
                                    'h-auto justify-start p-4 text-left transition-all duration-200',
                                    variantStyles[action.variant || 'default']
                                )}
                                onClick={action.onClick}
                                disabled={action.disabled}
                            >
                                {buttonContent}
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
