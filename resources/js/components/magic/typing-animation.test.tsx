import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypingAnimation, TypingAnimation2 } from '@/components/magic/typing-animation';

describe('TypingAnimation Components', () => {
  describe('TypingAnimation', () => {
    it('renders with cursor', () => {
      const { container } = render(<TypingAnimation text="Hello" />);
      // TypingAnimation starts empty and types character by character
      expect(container.innerHTML).toContain('|');
    });

    it('renders array of texts', () => {
      render(<TypingAnimation text={['Hello', 'World']} />);
      // Should render the typing container
      expect(screen.queryByText('|')).toBeInTheDocument();
    });

    it('displays cursor by default', () => {
      const { container } = render(<TypingAnimation text="Test" />);
      expect(container.innerHTML).toContain('|');
    });

    it('hides cursor when cursor prop is false', () => {
      const { container } = render(<TypingAnimation text="Test" cursor={false} />);
      expect(container.innerHTML).not.toContain('|');
    });

    it('applies custom className', () => {
      const { container } = render(<TypingAnimation text="Test" className="custom-class" />);
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('TypingAnimation2', () => {
    it('renders first word from array', () => {
      render(<TypingAnimation2 words={['Hello', 'World']} />);
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('renders cursor character', () => {
      const { container } = render(<TypingAnimation2 words={['Test']} />);
      expect(container.innerHTML).toContain('|');
    });

    it('applies custom className', () => {
      render(<TypingAnimation2 words={['Test']} className="custom-class" />);
      const container = screen.getByText('Test').closest('div');
      expect(container).toHaveClass('custom-class');
    });
  });
});
