import React from 'react';
import clsx from 'clsx';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ className, children, ...props }) => {
  return (
    <label className={clsx('block text-sm font-medium text-cyan-300', className)} {...props}>
      {children}
    </label>
  );
};
