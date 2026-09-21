import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly children?: ReactNode;
  readonly variant?: "primary" | "secondary" | "ghost" | "danger";
  readonly size?: "sm" | "md";
}

export function Button({ className, variant = "secondary", size = "md", ...props }: ButtonProps) {
  return <button className={cn("ui-button", `ui-button-${variant}`, `ui-button-${size}`, className)} {...props} />;
}
