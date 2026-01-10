'use client';

import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface PullToRefreshProps {
    onRefresh: () => Promise<void> | void;
    children: React.ReactNode;
    threshold?: number;
    className?: string;
}

export function PullToRefresh({
    onRefresh,
    children,
    threshold = 80,
    className,
}: PullToRefreshProps) {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        // Only trigger if at the top of the page
        if (window.scrollY === 0 && containerRef.current?.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setIsDragging(true);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        // Only pull down (positive diff)
        if (diff > 0) {
            // Add resistance - the further you pull, the harder it gets
            const resistance = 0.4;
            const newPullDistance = Math.min(
                diff * resistance,
                threshold * 1.5,
            );
            setPullDistance(newPullDistance);
        }
    };

    const handleTouchEnd = useCallback(async () => {
        if (!isDragging || isRefreshing) return;

        setIsDragging(false);

        if (pullDistance >= threshold) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
                setPullDistance(0);
            }
        } else {
            setPullDistance(0);
        }
    }, [isDragging, isRefreshing, pullDistance, threshold, onRefresh]);

    // Cleanup drag state on touch cancel
    useEffect(() => {
        const handleTouchCancel = () => {
            if (!isRefreshing) {
                setIsDragging(false);
                setPullDistance(0);
            }
        };

        const container = containerRef.current;
        container?.addEventListener('touchcancel', handleTouchCancel);

        return () => {
            container?.removeEventListener('touchcancel', handleTouchCancel);
        };
    }, [isRefreshing]);

    const pullProgress = Math.min(pullDistance / threshold, 1);
    const rotate = pullProgress * 360;

    return (
        <div
            ref={containerRef}
            className={cn('relative min-h-full', className)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull indicator */}
            <div
                className="pointer-events-none absolute right-0 left-0 flex items-center justify-center transition-transform"
                style={{
                    transform: `translateY(${Math.max(0, pullDistance - 40)}px)`,
                    opacity: pullProgress,
                    height: 0,
                }}
            >
                <div
                    className={cn(
                        'rounded-full p-2 transition-colors',
                        isRefreshing
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground',
                    )}
                >
                    <RefreshCw
                        className="size-5"
                        style={{
                            transform: `rotate(${rotate}deg)`,
                            transition: isRefreshing
                                ? 'transform 1s linear'
                                : 'none',
                        }}
                    />
                </div>
            </div>

            {/* Content */}
            <div
                className="transition-transform"
                style={{
                    transform: isRefreshing
                        ? 'scale(0.98)'
                        : `translateY(${Math.max(0, pullDistance - 20)}px)`,
                }}
            >
                {children}
            </div>
        </div>
    );
}
