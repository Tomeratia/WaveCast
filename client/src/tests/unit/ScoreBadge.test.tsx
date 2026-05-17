import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBadge } from '../../components/ui/ScoreBadge';

describe('ScoreBadge', () => {
  it('renders the label text', () => {
    render(<ScoreBadge score={80} label="epic" />);
    expect(screen.getByText('epic')).toBeInTheDocument();
  });

  it('renders each label variant', () => {
    const labels = ['flat', 'poor', 'fair', 'good', 'epic'] as const;
    for (const label of labels) {
      const { unmount } = render(<ScoreBadge score={50} label={label} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });

  it('applies size class for lg', () => {
    const { container } = render(<ScoreBadge score={70} label="good" size="lg" />);
    expect(container.firstChild).toHaveClass('text-lg');
  });
});
