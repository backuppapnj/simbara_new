import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'shimmer';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    ...props
}) => {
    const baseStyles =
        'relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 overflow-hidden';

    const variantStyles = {
        primary:
            'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl',
        secondary:
            'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700',
        shimmer:
            'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 bg-[length:200%_100%] text-white shadow-lg hover:shadow-xl',
    };

    const sizeStyles = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-2.5 text-base',
        lg: 'px-8 py-3 text-lg',
    };

    const animationVariants = {
        primary: {
            whileHover: { scale: 1.02, y: -2 },
            whileTap: { scale: 0.98 },
        },
        secondary: {
            whileHover: { scale: 1.02 },
            whileTap: { scale: 0.98 },
        },
        shimmer: {
            whileHover: { scale: 1.02, y: -2, backgroundPosition: '200% 0' },
            whileTap: { scale: 0.98 },
        },
    };

    return (
        <motion.button
            className={cn(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                className,
            )}
            {...animationVariants[variant]}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default AnimatedButton;
