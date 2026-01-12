import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';

interface ShimmerProps {
    children: React.ReactNode;
    className?: string;
    shimmerColor?: string;
    shimmerSize?: string;
    shimmerDuration?: number;
}

export const Shimmer: React.FC<ShimmerProps> = ({
    children,
    className,
    shimmerColor = 'rgba(255, 255, 255, 0.5)',
    shimmerSize = '100%',
    shimmerDuration = 2,
}) => {
    return (
        <div className={cn('relative overflow-hidden', className)}>
            <motion.div
                className="absolute inset-0 z-10"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                    duration: shimmerDuration,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: 'linear',
                }}
                style={{
                    background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
                    width: shimmerSize,
                }}
            />
            {children}
        </div>
    );
};

interface ShimmerButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
    children: React.ReactNode;
    shimmerColor?: string;
    shimmerSize?: string;
    className?: string;
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
    children,
    shimmerColor = 'rgba(255, 255, 255, 0.5)',
    shimmerSize = '100%',
    className,
    ...props
}) => {
    return (
        <motion.button
            className={cn(
                'relative overflow-hidden rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white shadow-lg transition-colors hover:bg-blue-700',
                className,
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            {...props}
        >
            <motion.div
                className="absolute inset-0"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{
                    duration: 1.5,
                    ease: 'linear',
                }}
                style={{
                    background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
                    width: shimmerSize,
                }}
            />
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
};

interface ShimmerTextProps {
    children: React.ReactNode;
    className?: string;
    shimmerColor?: string;
}

export const ShimmerText: React.FC<ShimmerTextProps> = ({
    children,
    className,
    shimmerColor = 'rgba(59, 130, 246, 0.5)',
}) => {
    return (
        <span className={cn('relative inline-block', className)}>
            <motion.span
                className="absolute inset-0"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: 'linear',
                }}
                style={{
                    background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
                }}
            />
            <span className="relative">{children}</span>
        </span>
    );
};

export default Shimmer;
