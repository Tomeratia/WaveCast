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
  sm: 'text-sm px-2 py-1',
  md: 'text-base px-3 py-1.5',
  lg: 'text-2xl px-5 py-3 font-bold',
};

export function ScoreBadge({ score, label, size = 'md', className }: ScoreBadgeProps) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-lg font-semibold',
        labelStyles[label],
        sizes[size],
        className,
      )}
    >
      <span>{score}</span>
      <span className="text-xs uppercase opacity-90">{label}</span>
    </span>
  );
}
