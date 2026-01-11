import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedButton } from '@/components/magic/animated-button';

describe('AnimatedButton', () => {
  it('renders children correctly', () => {
    render(<AnimatedButton>Click me</AnimatedButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<AnimatedButton variant="primary">Primary</AnimatedButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');

    rerender(<AnimatedButton variant="secondary">Secondary</AnimatedButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-neutral-100');
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<AnimatedButton size="sm">Small</AnimatedButton>);
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'text-sm');

    rerender(<AnimatedButton size="lg">Large</AnimatedButton>);
    expect(screen.getByRole('button')).toHaveClass('px-8', 'py-3', 'text-lg');
  });

  it('passes through additional props', () => {
    render(<AnimatedButton data-testid="test-button">Test</AnimatedButton>);
    expect(screen.getByTestId('test-button')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<AnimatedButton className="custom-class">Custom</AnimatedButton>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
