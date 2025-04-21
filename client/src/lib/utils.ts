import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price in Naira
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  // Convert to seconds
  const diffSecs = Math.floor(diffMs / 1000);
  
  if (diffSecs < 60) {
    return 'Just now';
  }
  
  // Convert to minutes
  const diffMins = Math.floor(diffSecs / 60);
  
  if (diffMins < 60) {
    return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  }
  
  // Convert to hours
  const diffHours = Math.floor(diffMins / 60);
  
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
  
  // Convert to days
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  
  // If more than 7 days, return the date
  return formatDate(date);
}

/**
 * Format a phone number to be displayed
 * If censor is true, it will hide most digits
 */
export function formatPhoneNumber(phone: string, censor: boolean = false): string {
  if (!phone) return '';
  
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (censor) {
    // Show only first 4 digits, censor the rest
    const firstFour = cleaned.substring(0, 4);
    const censored = '*'.repeat(Math.max(0, cleaned.length - 4));
    return `${firstFour}${censored}`;
  }
  
  // Format as +234 801 234 5678
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    // Nigerian format
    return `+234 ${cleaned.substring(1, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
  }
  
  return phone; // Return original if we can't format it
}

/**
 * Truncate text to a certain length
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Detect phone numbers in text using regex
 * This helps prevent users from bypassing the contact fee
 */
export function censorPhoneNumbers(text: string): string {
  if (!text) return '';
  
  // Regular expressions to catch different phone number formats
  const phoneRegexes = [
    /(\+?234|0)[0-9]{10}/g, // Regular format
    /(\+?234|0)[\s-]?[0-9]{3}[\s-]?[0-9]{3}[\s-]?[0-9]{4}/g, // With spaces or dashes
    /(zero|one|two|three|four|five|six|seven|eight|nine)[\s]+(zero|one|two|three|four|five|six|seven|eight|nine)/gi, // Spelled out
    /0\s*8\s*0\s*[0-9]/g // With spaces between digits
  ];
  
  let censoredText = text;
  
  // Apply each regex
  phoneRegexes.forEach(regex => {
    censoredText = censoredText.replace(regex, '••••••••••');
  });
  
  return censoredText;
}

/**
 * Calculate distance between two coordinates in kilometers
 */
export function calculateDistance(
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Detect mobile devices
 */
export function isMobileDevice(): boolean {
  return window.innerWidth <= 768;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

/**
 * Generate a random string (for references, etc.)
 */
export function generateRandomString(length: number = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate Nigerian phone number format
 */
export function isValidNigerianPhone(phone: string): boolean {
  const re = /^(\+234|0)[0-9]{10}$/;
  return re.test(phone);
}
