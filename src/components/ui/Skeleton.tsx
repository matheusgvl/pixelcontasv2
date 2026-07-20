import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect'
}) => {
  const baseClass = 'animate-pulse bg-border';
  
  const variants = {
    text: 'h-4 w-full rounded',
    rect: 'rounded-soft',
    circle: 'rounded-full'
  };

  return (
    <div className={`${baseClass} ${variants[variant]} ${className}`} />
  );
};
