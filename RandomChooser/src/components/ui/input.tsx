import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  const baseStyles =
    'block w-full px-3 py-2 bg-gray-800 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-cyan-300 placeholder-cyan-600';

  return <input className={clsx(baseStyles, className)} {...props} />;
};
