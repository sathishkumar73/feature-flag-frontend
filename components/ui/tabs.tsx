"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps extends React.ComponentPropsWithoutRef<"div"> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  className?: string;
}

export function Tabs({ defaultValue, value: controlledValue, onValueChange, className, children, ...props }: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || "");
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const setValue = onValueChange || setUncontrolledValue;
  React.useEffect(() => {
    console.log("[Tabs] value:", value, "controlledValue:", controlledValue);
  }, [value, controlledValue]);
  return (
    <div className={cn("tabs-root", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const childType = child.type as any;
          if (typeof childType === "function" && childType.displayName === "TabsTrigger") {
            return React.cloneElement(child as React.ReactElement<any>, { setValue });
          }
          if (typeof childType === "function" && childType.displayName === "TabsContent") {
            return React.cloneElement(child as React.ReactElement<any>, { parentValue: value });
          }
          return child;
        }
        return child;
      })}
    </div>
  );
}

interface TabsListProps extends React.ComponentPropsWithoutRef<"div"> {}
export function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <div className={cn("tabs-list flex gap-2 border-b mb-2", className)} {...props}>
      {children}
    </div>
  );
}

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  value: string;
  setValue?: (v: string) => void;
  className?: string;
}
export function TabsTrigger({ value, setValue, className, children, ...props }: TabsTriggerProps) {
  return (
    <button
      type="button"
      className={cn(
        "tabs-trigger px-4 py-2 rounded-t border-b-2 border-transparent text-sm font-medium transition-colors",
        className
      )}
      onClick={() => {
        console.log("[TabsTrigger] clicked, value:", value);
        setValue && setValue(value);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.ComponentPropsWithoutRef<"div"> {
  value: string;
  setValue?: (v: string) => void;
  className?: string;
}
export function TabsContent({ value, parentValue, setValue, className, children, ...props }: TabsContentProps & { parentValue?: string }) {
  React.useEffect(() => {
    console.log("[TabsContent] value:", value, "parentValue:", parentValue);
  }, [value, parentValue]);
  if (parentValue !== value) return null;
  return (
    <div className={cn("tabs-content p-2", className)} {...props}>
      {children}
    </div>
  );
}
TabsContent.displayName = "TabsContent";
