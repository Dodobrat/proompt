import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}
