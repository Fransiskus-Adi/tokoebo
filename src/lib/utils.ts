import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export function validateImageMax5MB(file: File) {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image size must be 5MB or smaller.")
  }
}
