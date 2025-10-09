import React from 'react';
import { cn } from '@/lib/utils';

export interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative inline-block text-left', className)}
      {...props}
    />
  )
);
DropdownMenu.displayName = 'DropdownMenu';

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
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
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
          className
        )}
        {...props}
      />
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end' | 'center';
  side?: 'top' | 'bottom' | 'left' | 'right';
  forceMount?: boolean;
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = 'center', side = 'bottom', forceMount = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  )
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

export interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, asChild = false, ...props }, ref) => {
    if (asChild) {
      return React.cloneElement(props.children as React.ReactElement, {
        ref,
        className: cn(
          'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        ),
        ...props
      });
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

export interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-2 py-1.5 text-sm font-semibold', className)}
      {...props}
    />
  )
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

export interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-muted', className)}
      {...props}
    />
  )
);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};