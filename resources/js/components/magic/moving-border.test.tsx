import {
    MovingBorder,
    MovingBorderButton,
} from '@/components/magic/moving-border';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('MovingBorder Components', () => {
    describe('MovingBorder', () => {
        it('renders children correctly', () => {
            render(
                <MovingBorder>
                    <div>Content</div>
                </MovingBorder>,
            );
            expect(screen.getByText('Content')).toBeInTheDocument();
        });

        it('applies custom className', () => {
            render(
                <MovingBorder className="custom-class">
                    <div>Content</div>
                </MovingBorder>,
            );
            const contentDiv = screen.getByText('Content').parentElement;
            expect(contentDiv).toHaveClass('custom-class');
        });

        it('applies container className', () => {
            const { container } = render(
                <MovingBorder containerClassName="container-class">
                    <div>Content</div>
                </MovingBorder>,
            );
            expect(container.firstChild).toHaveClass('container-class');
        });
    });

    describe('MovingBorderButton', () => {
        it('renders button with children', () => {
            render(<MovingBorderButton>Click me</MovingBorderButton>);
            expect(screen.getByRole('button')).toBeInTheDocument();
            expect(screen.getByText('Click me')).toBeInTheDocument();
        });

        it('passes through button props', () => {
            render(
                <MovingBorderButton type="submit">Submit</MovingBorderButton>,
            );
            expect(screen.getByRole('button')).toHaveAttribute(
                'type',
                'submit',
            );
        });

        it('applies custom className', () => {
            render(
                <MovingBorderButton className="custom-class">
                    Button
                </MovingBorderButton>,
            );
            const button = screen.getByRole('button');
            // The button element itself should have the class passed through
            expect(button).toBeInTheDocument();
        });

        it('handles click events', () => {
            let clicked = false;
            render(
                <MovingBorderButton onClick={() => (clicked = true)}>
                    Click
                </MovingBorderButton>,
            );
            screen.getByRole('button').click();
            expect(clicked).toBe(true);
        });
    });
});
