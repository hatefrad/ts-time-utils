/**
 * Constants for time conversions and utility types
 */

// Re-export shared types
export type { TimeUnit, FormatOptions } from './types.js';

// Milliseconds per unit
export const MILLISECONDS_PER_SECOND = 1000;
export const MILLISECONDS_PER_MINUTE = 60 * 1000;
export const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
export const MILLISECONDS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
export const MILLISECONDS_PER_MONTH = 30 * 24 * 60 * 60 * 1000; // Approximate
export const MILLISECONDS_PER_YEAR = 365 * 24 * 60 * 60 * 1000; // Approximate

// Seconds per unit  
export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 60 * 60;
export const SECONDS_PER_DAY = 24 * 60 * 60;
export const SECONDS_PER_WEEK = 7 * 24 * 60 * 60;
