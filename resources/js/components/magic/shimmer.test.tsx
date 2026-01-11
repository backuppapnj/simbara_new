import {
    Shimmer,
    ShimmerButton,
    ShimmerText,
} from '@/components/magic/shimmer';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Shimmer Components', () => {
    describe('Shimmer', () => {
        it('renders children correctly', () => {
            render(
                <Shimmer>
                    <span>Content</span>
                </Shimmer>,
            );
            expect(screen.getByText('Content')).toBeInTheDocument();
        });

        it('applies custom className', () => {
            render(
                <Shimmer className="custom-class">
                    <span>Content</span>
                </Shimmer>,
            );
            expect(screen.getByText('Content').parentElement).toHaveClass(
                'custom-class',
            );
        });
    });

    describe('ShimmerButton', () => {
        it('renders button with children', () => {
            render(<ShimmerButton>Click me</ShimmerButton>);
            expect(screen.getByRole('button')).toBeInTheDocument();
            expect(screen.getByText('Click me')).toBeInTheDocument();
        });

        it('applies default button styles', () => {
            render(<ShimmerButton>Button</ShimmerButton>);
            expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
        });

        it('passes through additional props', () => {
            render(
                <ShimmerButton data-testid="test-button">Test</ShimmerButton>,
            );
            expect(screen.getByTestId('test-button')).toBeInTheDocument();
        });
    });

    describe('ShimmerText', () => {
        it('renders text content', () => {
            render(<ShimmerText>Animated Text</ShimmerText>);
            expect(screen.getByText('Animated Text')).toBeInTheDocument();
        });

        it('applies custom className', () => {
            render(<ShimmerText className="text-xl">Text</ShimmerText>);
            expect(screen.getByText('Text').parentElement).toHaveClass(
                'text-xl',
            );
        });
    });
});
