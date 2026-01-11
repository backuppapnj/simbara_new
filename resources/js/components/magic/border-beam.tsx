import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';

interface BorderBeamProps {
    className?: string;
    size?: number;
    duration?: number;
    borderWidth?: number;
    colorFrom?: string;
    colorTo?: string;
    delay?: number;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
    className,
    size = 200,
    duration = 15,
    borderWidth = 1.5,
    colorFrom = '#3b82f6',
    colorTo = '#8b5cf6',
    delay = 0,
}) => {
    return (
        <div
            className={cn(
                'pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]',
                className,
            )}
            style={{
                borderWidth,
            }}
        >
            <motion.div
                className="absolute inset-0"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{
                    duration,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'linear',
                    delay,
                }}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        background: `conic-gradient(from 0deg, transparent 0deg, ${colorFrom} 90deg, transparent 180deg)`,
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background: `conic-gradient(from 180deg, transparent 0deg, ${colorTo} 90deg, transparent 180deg)`,
                    }}
                />
            </motion.div>

            {/* Beam effect */}
            <motion.div
                className="absolute inset-0"
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                    duration,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'linear',
                    delay,
                }}
                style={{
                    background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})`,
                    backgroundSize: `${size}% ${size}%`,
                }}
            />
        </div>
    );
};

interface BorderBeamWrapperProps {
    children: React.ReactNode;
    className?: string;
    beamClassName?: string;
    size?: number;
    duration?: number;
    borderWidth?: number;
    colorFrom?: string;
    colorTo?: string;
}

export const BorderBeamWrapper: React.FC<BorderBeamWrapperProps> = ({
    children,
    className,
    beamClassName,
    size = 200,
    duration = 15,
    borderWidth = 2,
    colorFrom = '#3b82f6',
    colorTo = '#8b5cf6',
}) => {
    return (
        <div className={cn('relative rounded-lg', className)}>
            {children}
            <BorderBeam
                className={beamClassName}
                size={size}
                duration={duration}
                borderWidth={borderWidth}
                colorFrom={colorFrom}
                colorTo={colorTo}
            />
        </div>
    );
};

export default BorderBeam;
