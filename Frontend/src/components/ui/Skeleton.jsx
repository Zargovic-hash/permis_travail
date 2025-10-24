// ============================================
// FICHIER 18: src/components/ui/Skeleton.jsx
// ============================================
import React from 'react';

export function Skeleton({ className = '', width, height, circle = false }) {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`animate-pulse bg-slate-200 ${circle ? 'rounded-full' : 'rounded-md'} ${className}`}
      style={style}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          height="16px" 
          width={i === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-5 ${className}`}>
      <Skeleton height="24px" width="60%" className="mb-4" />
      <SkeletonText lines={3} />
    </div>
  );
}