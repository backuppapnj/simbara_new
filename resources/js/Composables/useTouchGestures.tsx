'use client';

import { useRef, useCallback, useEffect, RefObject } from 'react';

interface SwipeHandlers {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
}

interface SwipeOptions {
    threshold?: number;
    restrain?: number;
    allowedTime?: number;
}

interface LongPressOptions {
    delay?: number;
    moveThreshold?: number;
}

interface TouchHandlers {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
}

interface SwipeState {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
}

export function useSwipe(
    handlers: SwipeHandlers,
    options: SwipeOptions = {}
): SwipeState {
    const {
        threshold = 50,
        restrain = 100,
        allowedTime = 300,
    } = options;

    const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.changedTouches[0];
        touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
        };
    }, []);

    const onTouchEnd = useCallback((e: React.TouchEvent) => {
        const touchStart = touchStartRef.current;
        if (!touchStart) return;

        const touch = e.changedTouches[0];
        const diffX = touch.clientX - touchStart.x;
        const diffY = touch.clientY - touchStart.y;
        const elapsedTime = Date.now() - touchStart.time;

        // Check if the gesture was fast enough and didn't move too much in the wrong direction
        if (elapsedTime <= allowedTime) {
            if (Math.abs(diffX) > threshold && Math.abs(diffY) <= restrain) {
                if (diffX > 0) {
                    handlers.onSwipeRight?.();
                } else {
                    handlers.onSwipeLeft?.();
                }
            } else if (Math.abs(diffY) > threshold && Math.abs(diffX) <= restrain) {
                if (diffY > 0) {
                    handlers.onSwipeDown?.();
                } else {
                    handlers.onSwipeUp?.();
                }
            }
        }

        touchStartRef.current = null;
    }, [handlers, threshold, restrain, allowedTime]);

    return { onTouchStart, onTouchEnd };
}

export function useLongPress(
    callback: () => void,
    options: LongPressOptions = {}
): TouchHandlers {
    const { delay = 500, moveThreshold = 10 } = options;

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);

    const start = useCallback((e: React.TouchEvent) => {
        const touch = e.changedTouches[0];
        touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
        };

        timeoutRef.current = setTimeout(() => {
            // Vibrate on long press
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            callback();
        }, delay);
    }, [callback, delay]);

    const clear = useCallback((e: React.TouchEvent) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Check if moved beyond threshold
        const touchStart = touchStartRef.current;
        if (touchStart && e.changedTouches) {
            const touch = e.changedTouches[0];
            const diffX = Math.abs(touch.clientX - touchStart.x);
            const diffY = Math.abs(touch.clientY - touchStart.y);

            if (diffX > moveThreshold || diffY > moveThreshold) {
                // Moved too much, don't trigger callback
                return;
            }
        }

        touchStartRef.current = null;
    }, [moveThreshold]);

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        start(e);
    }, [start]);

    const onTouchEnd = useCallback((e: React.TouchEvent) => {
        clear(e);
    }, [clear]);

    return { onTouchStart, onTouchEnd };
}

interface PinchState {
    scale: number;
    isPinching: boolean;
}

interface PinchCallbacks {
    onPinchStart?: () => void;
    onPinchMove?: (scale: number) => void;
    onPinchEnd?: (scale: number) => void;
}

export function usePinchZoom(
    callbacks: PinchCallbacks,
    elementRef: RefObject<HTMLElement>
): { scale: number; isPinching: boolean } {
    const [state, setState] = useState<PinchState>({ scale: 1, isPinching: false });

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        let initialDistance = 0;
        let initialScale = 1;

        const getDistance = (touch1: Touch, touch2: Touch): number => {
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        };

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                initialDistance = getDistance(e.touches[0], e.touches[1]);
                initialScale = state.scale;
                setState((prev) => ({ ...prev, isPinching: true }));
                callbacks.onPinchStart?.();
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2 && initialDistance > 0) {
                const currentDistance = getDistance(e.touches[0], e.touches[1]);
                const newScale = (currentDistance / initialDistance) * initialScale;

                setState((prev) => ({ ...prev, scale: newScale }));
                callbacks.onPinchMove?.(newScale);
            }
        };

        const handleTouchEnd = () => {
            if (state.isPinching) {
                setState((prev) => ({ ...prev, isPinching: false }));
                callbacks.onPinchEnd?.(state.scale);
                initialDistance = 0;
            }
        };

        element.addEventListener('touchstart', handleTouchStart as EventListener);
        element.addEventListener('touchmove', handleTouchMove as EventListener);
        element.addEventListener('touchend', handleTouchEnd as EventListener);

        return () => {
            element.removeEventListener('touchstart', handleTouchStart as EventListener);
            element.removeEventListener('touchmove', handleTouchMove as EventListener);
            element.removeEventListener('touchend', handleTouchEnd as EventListener);
        };
    }, [elementRef, callbacks, state.scale, state.isPinching]);

    return { scale: state.scale, isPinching: state.isPinching };
}

import { useState } from 'react';

interface SwipeableActionsProps {
    children: React.ReactNode;
    leftAction?: {
        label: string;
        icon?: React.ReactNode;
        onClick: () => void;
        bgColor?: string;
    };
    rightAction?: {
        label: string;
        icon?: React.ReactNode;
        onClick: () => void;
        bgColor?: string;
    };
    className?: string;
}

export function SwipeableActions({
    children,
    leftAction,
    rightAction,
    className,
}: SwipeableActionsProps) {
    const [translateX, setTranslateX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startX = useRef(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX - translateX;
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;

        const currentX = e.touches[0].clientX;
        const diff = currentX - startX.current;

        const maxSwipe = 100;
        const newTranslateX = Math.max(-maxSwipe, Math.min(maxSwipe, diff));
        setTranslateX(newTranslateX);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);

        const threshold = 60;

        if (translateX > threshold && rightAction) {
            rightAction.onClick();
            setTranslateX(0);
        } else if (translateX < -threshold && leftAction) {
            leftAction.onClick();
            setTranslateX(0);
        } else {
            setTranslateX(0);
        }
    };

    return (
        <div className={cn('relative overflow-hidden', className)}>
            {/* Right Action (revealed when swiping left) */}
            {rightAction && (
                <div
                    className={cn(
                        'absolute inset-y-0 right-0 flex items-center justify-end px-4 transition-transform',
                        rightAction.bgColor || 'bg-blue-500'
                    )}
                    style={{ transform: `translateX(${Math.min(0, translateX)}px)` }}
                >
                    <div className="flex items-center gap-2 text-white">
                        {rightAction.icon}
                        <span className="font-medium">{rightAction.label}</span>
                    </div>
                </div>
            )}

            {/* Left Action (revealed when swiping right) */}
            {leftAction && (
                <div
                    className={cn(
                        'absolute inset-y-0 left-0 flex items-center justify-start px-4 transition-transform',
                        leftAction.bgColor || 'bg-red-500'
                    )}
                    style={{ transform: `translateX(${Math.max(0, translateX)}px)` }}
                >
                    <div className="flex items-center gap-2 text-white">
                        <span className="font-medium">{leftAction.label}</span>
                        {leftAction.icon}
                    </div>
                </div>
            )}

            {/* Content */}
            <div
                className="relative bg-background transition-transform"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    transform: `translateX(${translateX}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                }}
            >
                {children}
            </div>
        </div>
    );
}

function cn(...classes: (string | undefined | boolean)[]) {
    return classes.filter(Boolean).join(' ');
}
