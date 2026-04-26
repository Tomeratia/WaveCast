import { twMerge } from 'tailwind-merge';
import type { ScoreLabel } from '@shared/types';

interface ScoreBadgeProps {
  score: number;
  label: ScoreLabel;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const labelStyles: Record<ScoreLabel, string> = {
  flat: 'bg-score-flat text-white',
  poor: 'bg-score-poor text-white',
  fair: 'bg-score-fair text-white',
  good: 'bg-score-good text-white',
  epic: 'bg-score-epic text-white',
};

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-lg px-4 py-2 font-bold',
};

export function ScoreBadge({ label, size = 'md', className }: Omit<ScoreBadgeProps, 'score'> & { score: number }) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center rounded-lg font-semibold uppercase tracking-wide',
        labelStyles[label],
        sizes[size],
        className,
      )}
    >
      {label}
    </span>
  );
}
