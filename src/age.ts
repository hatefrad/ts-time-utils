import { TimeUnit } from './constants.js';
import type { AgeResult } from './types.js';

/**
 * Calculate detailed age from birth date
 * @param birthDate - date of birth
 * @param referenceDate - date to calculate age from (defaults to now)
 */
export function calculateAge(birthDate: Date, referenceDate: Date = new Date()): AgeResult {
  const birth = new Date(birthDate);
  const reference = new Date(referenceDate);
  
  let years = reference.getFullYear() - birth.getFullYear();
  let months = reference.getMonth() - birth.getMonth();
  let days = reference.getDate() - birth.getDate();
  
  // Adjust for negative days
  if (days < 0) {
    months--;
    const lastMonth = new Date(reference.getFullYear(), reference.getMonth(), 0);
    days += lastMonth.getDate();
  }
  
  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }
  
  const totalDays = Math.floor((reference.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
  const totalMonths = years * 12 + months;
  
  return { years, months, days, totalDays, totalMonths };
}

/**
 * Get age in specific units
 * @param birthDate - date of birth
 * @param unit - unit to return age in
 * @param referenceDate - date to calculate from (defaults to now)
 */
export function getAgeInUnits(
  birthDate: Date, 
  unit: TimeUnit, 
  referenceDate: Date = new Date()
): number {
  const diffMs = referenceDate.getTime() - birthDate.getTime();
  
  switch (unit) {
    case 'years':
      return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
    case 'months':
      return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
    case 'weeks':
      return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
    case 'days':
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    case 'hours':
      return Math.floor(diffMs / (1000 * 60 * 60));
    case 'minutes':
      return Math.floor(diffMs / (1000 * 60));
    case 'seconds':
      return Math.floor(diffMs / 1000);
    case 'milliseconds':
    default:
      return diffMs;
  }
}

/**
 * Determine life stage based on age
 * @param birthDate - date of birth
 * @param referenceDate - date to calculate from (defaults to now)
 */
export function getLifeStage(
  birthDate: Date, 
  referenceDate: Date = new Date()
): 'infant' | 'child' | 'teen' | 'adult' | 'senior' {
  const ageInYears = getAgeInUnits(birthDate, 'years', referenceDate);
  
  if (ageInYears < 2) return 'infant';
  if (ageInYears < 13) return 'child';
  if (ageInYears < 18) return 'teen';
  if (ageInYears < 65) return 'adult';
  return 'senior';
}

/**
 * Get the next birthday date
 * @param birthDate - date of birth
 * @param referenceDate - date to calculate from (defaults to now)
 */
export function getNextBirthday(birthDate: Date, referenceDate: Date = new Date()): Date {
  const birth = new Date(birthDate);
  const reference = new Date(referenceDate);
  
  const nextBirthday = new Date(reference.getFullYear(), birth.getMonth(), birth.getDate());
  
  // If birthday has passed this year, get next year's birthday
  if (nextBirthday <= reference) {
    nextBirthday.setFullYear(reference.getFullYear() + 1);
  }
  
  return nextBirthday;
}

/**
 * Get days until next birthday
 * @param birthDate - date of birth
 * @param referenceDate - date to calculate from (defaults to now)
 */
export function getDaysUntilBirthday(birthDate: Date, referenceDate: Date = new Date()): number {
  const nextBirthday = getNextBirthday(birthDate, referenceDate);
  return Math.ceil((nextBirthday.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Check if today is someone's birthday
 * @param birthDate - date of birth
 * @param referenceDate - date to check (defaults to now)
 */
export function isBirthday(birthDate: Date, referenceDate: Date = new Date()): boolean {
  const birth = new Date(birthDate);
  const reference = new Date(referenceDate);
  
  return (
    birth.getMonth() === reference.getMonth() &&
    birth.getDate() === reference.getDate()
  );
}