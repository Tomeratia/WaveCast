import { type HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
        className,
      )}
      {...props}
    />
  );
}
