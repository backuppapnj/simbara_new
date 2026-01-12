import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';

interface MovingBorderProps {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
    duration?: number;
    borderRadius?: string;
    borderClassName?: string;
    from?: string;
    to?: string;
    onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;
}

export const MovingBorder: React.FC<MovingBorderProps> = ({
    children,
    className,
    containerClassName,
    duration = 2000,
    borderRadius = '1.5rem',
    borderClassName,
    from = '#3b82f6',
    to = '#8b5cf6',
    onClick,
}) => {
    return (
        <motion.div
            className={cn(
                'group relative inline-flex h-full w-full overflow-hidden rounded-[var(--radius)] bg-transparent p-[1px]',
                containerClassName,
            )}
            style={
                {
                    '--radius': borderRadius,
                } as React.CSSProperties
            }
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
            <div
                className="absolute inset-0"
                style={{ borderRadius: `var(--radius)` }}
            />
            <motion.div
                className={cn(
                    'absolute inset-[-1000%] opacity-[0.6]',
                    borderClassName,
                )}
                animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                    duration,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'linear',
                }}
                style={{
                    background: `linear-gradient(90deg, ${from}, ${to}, ${from})`,
                    backgroundSize: '200% 200%',
                    borderRadius: `var(--radius)`,
                }}
            />
            <div
                className={cn(
                    'relative inline-flex h-full w-full items-center justify-center rounded-[var(--radius)] bg-white backdrop-blur-xl dark:bg-neutral-950',
                    className,
                )}
                style={
                    {
                        '--radius': borderRadius,
                    } as React.CSSProperties
                }
            >
                {children}
            </div>
        </motion.div>
    );
};

interface MovingBorderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
    duration?: number;
    borderRadius?: string;
    borderClassName?: string;
    from?: string;
    to?: string;
}

export const MovingBorderButton: React.FC<MovingBorderButtonProps> = ({
    children,
    className,
    containerClassName,
    duration = 2000,
    borderRadius = '0.75rem',
    borderClassName,
    from = '#3b82f6',
    to = '#8b5cf6',
    ...props
}) => {
    return (
        <MovingBorder
            className={className}
            containerClassName={containerClassName}
            duration={duration}
            borderRadius={borderRadius}
            borderClassName={borderClassName}
            from={from}
            to={to}
        >
            <button {...props}>{children}</button>
        </MovingBorder>
    );
};

export default MovingBorder;
