import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateZipCode(zip: string): boolean {
  return /^\d{5}$/.test(zip)
}

export function formatPhone(phone: string | null): string {
  if (!phone) return ''
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}
