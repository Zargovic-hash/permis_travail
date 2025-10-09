import React from 'react';
import { cn } from '@/lib/utils';

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ className, open = false, onOpenChange, children, ...props }, ref) => {
    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cn('fixed inset-0 z-50 flex items-center justify-center', className)}
        {...props}
      >
        <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
        <div className="relative z-50">
          {children}
        </div>
      </div>
    );
  }
);
Dialog.displayName = 'Dialog';

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative bg-background border rounded-lg shadow-lg max-w-lg w-full mx-4',
        className
      )}
      {...props}
    />
  )
);
DialogContent.displayName = 'DialogContent';

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);
DialogHeader.displayName = 'DialogHeader';

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
DialogTitle.displayName = 'DialogTitle';

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);
DialogDescription.displayName = 'DialogDescription';

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0', className)}
      {...props}
    />
  )
);
DialogFooter.displayName = 'DialogFooter';

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};