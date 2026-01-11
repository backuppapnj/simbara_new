import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as MagicComponents from '@/components/magic';

describe('MagicUI Components - Exports', () => {
  it('exports all components', () => {
    expect(MagicComponents).toHaveProperty('AnimatedButton');
    expect(MagicComponents).toHaveProperty('Shimmer');
    expect(MagicComponents).toHaveProperty('ShimmerButton');
    expect(MagicComponents).toHaveProperty('ShimmerText');
    expect(MagicComponents).toHaveProperty('TypingAnimation');
    expect(MagicComponents).toHaveProperty('TypingAnimation2');
    expect(MagicComponents).toHaveProperty('BorderBeam');
    expect(MagicComponents).toHaveProperty('BorderBeamWrapper');
    expect(MagicComponents).toHaveProperty('MovingBorder');
    expect(MagicComponents).toHaveProperty('MovingBorderButton');
  });

  it('AnimatedButton renders and accepts all variants', () => {
    const { rerender } = render(<MagicComponents.AnimatedButton variant="primary">Primary</MagicComponents.AnimatedButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<MagicComponents.AnimatedButton variant="secondary">Secondary</MagicComponents.AnimatedButton>);
    rerender(<MagicComponents.AnimatedButton variant="shimmer">Shimmer</MagicComponents.AnimatedButton>);
  });

  it('ShimmerButton renders with animations', () => {
    render(<MagicComponents.ShimmerButton>Shimmer</MagicComponents.ShimmerButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Shimmer')).toBeInTheDocument();
  });

  it('TypingAnimation renders with cursor', () => {
    const { container } = render(<MagicComponents.TypingAnimation text="Hello World" />);
    // TypingAnimation shows cursor character
    expect(container.innerHTML).toContain('|');
  });

  it('BorderBeamWrapper wraps content correctly', () => {
    render(
      <MagicComponents.BorderBeamWrapper>
        <div>Wrapped Content</div>
      </MagicComponents.BorderBeamWrapper>
    );
    expect(screen.getByText('Wrapped Content')).toBeInTheDocument();
  });

  it('MovingBorderButton renders interactive button', () => {
    render(<MagicComponents.MovingBorderButton>Moving Border</MagicComponents.MovingBorderButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Moving Border')).toBeInTheDocument();
  });
});
