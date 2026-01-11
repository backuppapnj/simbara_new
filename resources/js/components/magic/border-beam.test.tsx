import { BorderBeam, BorderBeamWrapper } from '@/components/magic/border-beam';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('BorderBeam Components', () => {
    describe('BorderBeam', () => {
        it('renders with default props', () => {
            const { container } = render(<BorderBeam />);
            expect(container.firstChild).toBeInTheDocument();
        });

        it('applies custom className', () => {
            const { container } = render(
                <BorderBeam className="custom-class" />,
            );
            expect(container.firstChild).toHaveClass('custom-class');
        });
    });

    describe('BorderBeamWrapper', () => {
        it('renders children', () => {
            render(
                <BorderBeamWrapper>
                    <div>Content</div>
                </BorderBeamWrapper>,
            );
            expect(screen.getByText('Content')).toBeInTheDocument();
        });

        it('applies wrapper className', () => {
            render(
                <BorderBeamWrapper className="custom-class">
                    <div>Content</div>
                </BorderBeamWrapper>,
            );
            const wrapper = screen.getByText('Content').parentElement;
            expect(wrapper).toHaveClass('custom-class');
        });

        it('renders with beam effect', () => {
            const { container } = render(
                <BorderBeamWrapper>
                    <div>Content</div>
                </BorderBeamWrapper>,
            );
            // Should have the beam overlay
            expect(
                container.querySelector('.pointer-events-none'),
            ).toBeInTheDocument();
        });
    });
});
