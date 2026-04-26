import { type ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  primary: 'bg-ocean-600 text-white hover:bg-ocean-700',
  secondary: 'border border-ocean-300 bg-white text-ocean-700 hover:bg-ocean-50 dark:bg-gray-800 dark:text-ocean-200 dark:hover:bg-gray-700',
  ghost: 'text-ocean-600 hover:bg-ocean-50 dark:text-ocean-300 dark:hover:bg-gray-800',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size]), className)}
      {...props}
    />
  );
}
