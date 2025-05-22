'use client';

import * as React from 'react';
import { type DialogProps } from '@radix-ui/react-dialog';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Простая замена CommandPrimitive
const CommandBase = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
      className
    )}
    {...props}
  />
));
CommandBase.displayName = 'Command';

// Простая замена CommandPrimitive.Input
const CommandInputBase = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
));
CommandInputBase.displayName = 'CommandInput';

// Простая замена CommandPrimitive.List
const CommandListBase = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
));
CommandListBase.displayName = 'CommandList';

// Простая замена CommandPrimitive.Empty
const CommandEmptyBase = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('py-6 text-center text-sm', className)}
    {...props}
  />
));
CommandEmptyBase.displayName = 'CommandEmpty';

// Простая замена CommandPrimitive.Group
const CommandGroupBase = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-foreground',
      className
    )}
    {...props}
  />
));
CommandGroupBase.displayName = 'CommandGroup';

// Простая замена CommandPrimitive.Separator
const CommandSeparatorBase = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('-mx-1 h-px bg-border', className)}
    {...props}
  />
));
CommandSeparatorBase.displayName = 'CommandSeparator';

// Простая замена CommandPrimitive.Item
const CommandItemBase = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { selected?: boolean; disabled?: boolean }
>(({ className, selected, disabled, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
      disabled && "pointer-events-none opacity-50",
      selected && "bg-accent text-accent-foreground",
      className
    )}
    data-selected={selected ? 'true' : undefined}
    data-disabled={disabled ? 'true' : undefined}
    role="option"
    aria-selected={selected}
    {...props}
  />
));
CommandItemBase.displayName = 'CommandItem';

// Переименовываем компоненты для совместимости с оригинальным кодом
const Command = CommandBase;
const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandInputBase>,
  React.ComponentPropsWithoutRef<typeof CommandInputBase>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandInputBase
      ref={ref}
      className={className}
      {...props}
    />
  </div>
));
CommandInput.displayName = 'CommandInput';

const CommandList = CommandListBase;
const CommandEmpty = CommandEmptyBase;
const CommandGroup = CommandGroupBase;
const CommandSeparator = CommandSeparatorBase;
const CommandItem = CommandItemBase;

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground',
        className
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
