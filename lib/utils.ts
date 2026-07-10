import { clsx, type ClassValue } from "clsx"; // Conditionally joins class names.
import { twMerge } from "tailwind-merge"; // Removes conflicting Tailwind classes.

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}