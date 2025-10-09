import React from 'react';
import { cn } from '@/lib/utils';

export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {}

const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative', className)}
      {...props}
    />
  )
);
Popover.displayName = 'Popover';

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ className, asChild = false, ...props }, ref) => {
    if (asChild) {
      return React.cloneElement(props.children as React.ReactElement, {
        ref,
        className: cn(className),
        ...props
      });
    }
    
    return (
      <button
        ref={ref}
        className={cn(className)}
        {...props}
      />
    );
  }
);
PopoverTrigger.displayName = 'PopoverTrigger';

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end' | 'center';
  side?: 'top' | 'bottom' | 'left' | 'right';
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = 'center', side = 'bottom', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  )
);
PopoverContent.displayName = 'PopoverContent';

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
};