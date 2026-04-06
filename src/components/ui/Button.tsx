"use client";
import { cn } from "@/lib/utils/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ewha-700 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-ewha-700 text-white hover:bg-ewha-800 active:bg-ewha-900": variant === "primary",
            "bg-ewha-50 text-ewha-700 border border-ewha-200 hover:bg-ewha-100": variant === "secondary",
            "text-gray-600 hover:bg-gray-100": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "danger",
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2.5 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
