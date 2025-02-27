'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-xl bg-white/30 p-2 shadow-lg backdrop-blur-md",
      // "dark:bg-gray-900/30 dark:shadow-md",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-semibold transition-all",
      "bg-gradient-to-b from-white to-gray-400 text-gray-700 shadow-md",
      // "dark:from-gray-800 dark:to-gray-700 dark:text-white",
      "hover:bg-gradient-to-t hover:from-gray-100 hover:to-white",  
      // "dark:hover:from-gray-700 dark:hover:to-gray-600",
      "data-[state=active]:bg-blue-500 data-[state=active]:shadow-lg data-[state=active]:shadow-gray-400 data-[state=active:bg-gradient-to-t data-[state=active]:from-gray-100 data-[state=active]:to-white",
      "focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 rounded-xl bg-white p-6 shadow-lg transition-all",
      "focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
