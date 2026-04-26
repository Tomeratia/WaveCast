import { twMerge } from 'tailwind-merge';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={twMerge(
        'h-8 w-8 animate-spin rounded-full border-4 border-ocean-200 border-t-ocean-600',
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
