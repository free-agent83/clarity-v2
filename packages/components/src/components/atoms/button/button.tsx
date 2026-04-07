import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";

/**
 * Button variants mapped to Nivoda DS Foundation.
 *
 * Variant axis = visual style (contained, outlined, text, link)
 * Intent axis  = semantic colour (primary, success, error)
 * Size axis    = sm, md, lg
 *
 * Figma source: DSW-Web-Components / Button
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:border-disabled-border",
  {
    variants: {
      variant: {
        contained:
          "bg-primary text-foreground-inverse hover:bg-primary-hover active:bg-primary-active",
        secondary:
          "bg-secondary text-secondary-text hover:bg-secondary-hover active:bg-secondary-active",
        outlined:
          "border border-border bg-background text-foreground-muted hover:text-primary-hover hover:border-border-focus active:bg-primary-subtle active:text-primary-hover active:border-border-focus",
        text:
          "text-foreground-muted hover:text-primary-hover hover:bg-primary-subtle active:bg-[var(--color-primitive-purple-100)]",
        link:
          "text-primary-hover underline-offset-4 hover:underline",
      },
      intent: {
        primary: "",
        success: "",
        error: "",
      },
      size: {
        sm: "h-8 px-2 py-1.5 text-xs",
        md: "h-10 px-3 py-3",
        lg: "h-12 px-5 py-5 text-base",
      },
    },
    compoundVariants: [
      // Success — contained
      { variant: "contained", intent: "success", className: "bg-success hover:bg-success-hover active:bg-success" },
      // Success — outlined
      { variant: "outlined", intent: "success", className: "text-success border-success hover:text-success-hover hover:border-success-hover active:text-success" },
      // Success — text
      { variant: "text", intent: "success", className: "text-success hover:text-success-hover hover:bg-success-subtle active:bg-[var(--color-primitive-green-100)]" },

      // Error — contained
      { variant: "contained", intent: "error", className: "bg-error hover:bg-error-hover active:bg-error" },
      // Error — outlined
      { variant: "outlined", intent: "error", className: "text-error border-error hover:text-error-hover hover:border-error-hover active:text-error" },
      // Error — text
      { variant: "text", intent: "error", className: "text-error hover:text-error-hover hover:bg-error-subtle active:bg-[var(--color-primitive-red-100)]" },
    ],
    defaultVariants: {
      variant: "contained",
      intent: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, intent, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, intent, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
