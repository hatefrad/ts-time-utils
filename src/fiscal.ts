/**
 * @fileoverview Fiscal year and accounting period utilities
 * Supports configurable fiscal year start months for business calculations
 */

/**
 * Fiscal year configuration
 */
export interface FiscalConfig {
  /** Month when fiscal year starts (1-12, default: 1 for January) */
  startMonth: number;
}

const DEFAULT_CONFIG: FiscalConfig = {
  startMonth: 1, // January (calendar year)
};

/**
 * Get the fiscal year for a given date
 * @param date - The date to check
 * @param config - Fiscal year configuration
 * @returns The fiscal year number
 * @example
 * // Calendar year (Jan start)
 * getFiscalYear(new Date('2024-03-15')) // 2024
 * 
 * // April fiscal year (UK/India style)
 * getFiscalYear(new Date('2024-03-15'), { startMonth: 4 }) // 2023
 * getFiscalYear(new Date('2024-04-15'), { startMonth: 4 }) // 2024
 * 
 * // July fiscal year (Australia style)
 * getFiscalYear(new Date('2024-06-15'), { startMonth: 7 }) // 2023
 * getFiscalYear(new Date('2024-07-15'), { startMonth: 7 }) // 2024
 */
export function getFiscalYear(
  date: Date,
  config: Partial<FiscalConfig> = {}
): number {
  const { startMonth } = { ...DEFAULT_CONFIG, ...config };
  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();

  if (startMonth === 1) {
    return year;
  }

  // Fiscal year is named by when it starts
  // If current month is before fiscal year start, we're still in the fiscal year that started last calendar year
  return month < startMonth ? year - 1 : year;
}

/**
 * Get the fiscal quarter for a given date (1-4)
 * @param date - The date to check
 * @param config - Fiscal year configuration
 * @returns The fiscal quarter (1-4)
 * @example
 * // Calendar year quarters
 * getFiscalQuarter(new Date('2024-01-15')) // 1
 * getFiscalQuarter(new Date('2024-04-15')) // 2
 * 
 * // April fiscal year
 * getFiscalQuarter(new Date('2024-04-15'), { startMonth: 4 }) // 1
 * getFiscalQuarter(new Date('2024-07-15'), { startMonth: 4 }) // 2
 */
export function getFiscalQuarter(
  date: Date,
  config: Partial<FiscalConfig> = {}
): number {
  const { startMonth } = { ...DEFAULT_CONFIG, ...config };
  const month = date.getMonth() + 1; // 1-12

  // Calculate months since fiscal year start
  let monthsIntoFiscalYear = month - startMonth;
  if (monthsIntoFiscalYear < 0) {
    monthsIntoFiscalYear += 12;
  }

  return Math.floor(monthsIntoFiscalYear / 3) + 1;
}

/**
 * Get the start date of a fiscal year
 * @param fiscalYear - The fiscal year
 * @param config - Fiscal year configuration
 * @returns Start date of the fiscal year
 * @example
 * getFiscalYearStart(2024) // 2024-01-01
 * getFiscalYearStart(2024, { startMonth: 4 }) // 2024-04-01 (FY2024 starts Apr 2024)
 * getFiscalYearStart(2024, { startMonth: 7 }) // 2024-07-01 (FY2024 starts Jul 2024)
 */
export function getFiscalYearStart(
  fiscalYear: number,
  config: Partial<FiscalConfig> = {}
): Date {
  const { startMonth } = { ...DEFAULT_CONFIG, ...config };
  // Fiscal year N starts in the startMonth of calendar year N
  return new Date(fiscalYear, startMonth - 1, 1);
}

/**
 * Get the end date of a fiscal year
 * @param fiscalYear - The fiscal year
 * @param config - Fiscal year configuration
 * @returns End date of the fiscal year (last day, 23:59:59.999)
 * @example
 * getFiscalYearEnd(2024) // 2024-12-31
 * getFiscalYearEnd(2024, { startMonth: 4 }) // 2025-03-31 (FY2024 ends Mar 2025)
 * getFiscalYearEnd(2024, { startMonth: 7 }) // 2025-06-30 (FY2024 ends Jun 2025)
 */
export function getFiscalYearEnd(
  fiscalYear: number,
  config: Partial<FiscalConfig> = {}
): Date {
  const { startMonth } = { ...DEFAULT_CONFIG, ...config };

  if (startMonth === 1) {
    return new Date(fiscalYear, 11, 31, 23, 59, 59, 999);
  }

  // FY ends the day before the next FY starts
  // FY N ends in (startMonth - 1) of year (N + 1)
  const endMonth = startMonth - 1; // Month before start month (0-indexed: 0=Jan...11=Dec)
  const endYear = fiscalYear + 1;

  // Get last day of the end month
  const lastDay = new Date(endYear, endMonth, 0).getDate();
  return new Date(endYear, endMonth - 1, lastDay, 23, 59, 59, 999);
}

/**
 * Get the start date of a fiscal quarter
 * @param fiscalYear - The fiscal year
 * @param quarter - The quarter (1-4)
 * @param config - Fiscal year configuration
 * @returns Start date of the fiscal quarter
 * @example
 * getFiscalQuarterStart(2024, 1) // 2024-01-01
 * getFiscalQuarterStart(2024, 2) // 2024-04-01
 * getFiscalQuarterStart(2024, 1, { startMonth: 4 }) // 2023-04-01
 * getFiscalQuarterStart(2024, 2, { startMonth: 4 }) // 2023-07-01
 */
export function getFiscalQuarterStart(
  fiscalYear: number,
  quarter: number,
  config: Partial<FiscalConfig> = {}
): Date {
  if (quarter < 1 || quarter > 4) {
    throw new Error('Quarter must be between 1 and 4');
  }

  const { startMonth } = { ...DEFAULT_CONFIG, ...config };
  const fyStart = getFiscalYearStart(fiscalYear, config);

  // Add (quarter - 1) * 3 months to fiscal year start
  const monthsToAdd = (quarter - 1) * 3;
  const resultMonth = fyStart.getMonth() + monthsToAdd;

  return new Date(fyStart.getFullYear(), resultMonth, 1);
}

/**
 * Get the end date of a fiscal quarter
 * @param fiscalYear - The fiscal year
 * @param quarter - The quarter (1-4)
 * @param config - Fiscal year configuration
 * @returns End date of the fiscal quarter (last day, 23:59:59.999)
 * @example
 * getFiscalQuarterEnd(2024, 1) // 2024-03-31
 * getFiscalQuarterEnd(2024, 2) // 2024-06-30
 * getFiscalQuarterEnd(2024, 1, { startMonth: 4 }) // 2023-06-30
 */
export function getFiscalQuarterEnd(
  fiscalYear: number,
  quarter: number,
  config: Partial<FiscalConfig> = {}
): Date {
  if (quarter < 1 || quarter > 4) {
    throw new Error('Quarter must be between 1 and 4');
  }

  const quarterStart = getFiscalQuarterStart(fiscalYear, quarter, config);

  // End of quarter is last day of the third month
  const endMonth = quarterStart.getMonth() + 3;
  const lastDay = new Date(quarterStart.getFullYear(), endMonth, 0).getDate();

  return new Date(
    quarterStart.getFullYear(),
    endMonth - 1,
    lastDay,
    23,
    59,
    59,
    999
  );
}

/**
 * Check if two dates are in the same fiscal year
 * @param date1 - First date
 * @param date2 - Second date
 * @param config - Fiscal year configuration
 * @returns True if both dates are in the same fiscal year
 */
export function isSameFiscalYear(
  date1: Date,
  date2: Date,
  config: Partial<FiscalConfig> = {}
): boolean {
  return getFiscalYear(date1, config) === getFiscalYear(date2, config);
}

/**
 * Check if two dates are in the same fiscal quarter
 * @param date1 - First date
 * @param date2 - Second date
 * @param config - Fiscal year configuration
 * @returns True if both dates are in the same fiscal year and quarter
 */
export function isSameFiscalQuarter(
  date1: Date,
  date2: Date,
  config: Partial<FiscalConfig> = {}
): boolean {
  return (
    getFiscalYear(date1, config) === getFiscalYear(date2, config) &&
    getFiscalQuarter(date1, config) === getFiscalQuarter(date2, config)
  );
}

/**
 * Get the fiscal month (1-12) within the fiscal year
 * @param date - The date to check
 * @param config - Fiscal year configuration
 * @returns The fiscal month (1-12, where 1 is the first month of fiscal year)
 * @example
 * getFiscalMonth(new Date('2024-01-15')) // 1
 * getFiscalMonth(new Date('2024-04-15'), { startMonth: 4 }) // 1
 * getFiscalMonth(new Date('2024-03-15'), { startMonth: 4 }) // 12
 */
export function getFiscalMonth(
  date: Date,
  config: Partial<FiscalConfig> = {}
): number {
  const { startMonth } = { ...DEFAULT_CONFIG, ...config };
  const month = date.getMonth() + 1; // 1-12

  let fiscalMonth = month - startMonth + 1;
  if (fiscalMonth <= 0) {
    fiscalMonth += 12;
  }

  return fiscalMonth;
}

/**
 * Get the number of days remaining in the fiscal year
 * @param date - The date to check
 * @param config - Fiscal year configuration
 * @returns Number of days remaining in the fiscal year
 */
export function getDaysRemainingInFiscalYear(
  date: Date,
  config: Partial<FiscalConfig> = {}
): number {
  const fiscalYear = getFiscalYear(date, config);
  const fyEnd = getFiscalYearEnd(fiscalYear, config);

  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = fyEnd.getTime() - startOfDay.getTime();

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get the number of days elapsed in the fiscal year
 * @param date - The date to check
 * @param config - Fiscal year configuration
 * @returns Number of days elapsed in the fiscal year (including the given date)
 */
export function getDaysElapsedInFiscalYear(
  date: Date,
  config: Partial<FiscalConfig> = {}
): number {
  const fiscalYear = getFiscalYear(date, config);
  const fyStart = getFiscalYearStart(fiscalYear, config);

  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = startOfDay.getTime() - fyStart.getTime();

  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Get fiscal year progress as a percentage
 * @param date - The date to check
 * @param config - Fiscal year configuration
 * @returns Percentage of fiscal year completed (0-100)
 */
export function getFiscalYearProgress(
  date: Date,
  config: Partial<FiscalConfig> = {}
): number {
  const fiscalYear = getFiscalYear(date, config);
  const fyStart = getFiscalYearStart(fiscalYear, config);
  const fyEnd = getFiscalYearEnd(fiscalYear, config);

  const totalDays = Math.ceil(
    (fyEnd.getTime() - fyStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const elapsed = getDaysElapsedInFiscalYear(date, config);

  return Math.min(100, Math.round((elapsed / totalDays) * 10000) / 100);
}

/**
 * Get the fiscal week number (1-53) within the fiscal year
 * @param date - The date to check
 * @param config - Fiscal year configuration
 * @returns The fiscal week number
 */
export function getFiscalWeek(
  date: Date,
  config: Partial<FiscalConfig> = {}
): number {
  const elapsed = getDaysElapsedInFiscalYear(date, config);
  return Math.ceil(elapsed / 7);
}

/**
 * Common fiscal year configurations
 */
export const FISCAL_PRESETS = {
  /** Calendar year (January start) - Default */
  CALENDAR: { startMonth: 1 } as FiscalConfig,
  /** UK/India government fiscal year (April start) */
  UK_INDIA: { startMonth: 4 } as FiscalConfig,
  /** Australian fiscal year (July start) */
  AUSTRALIA: { startMonth: 7 } as FiscalConfig,
  /** US federal government fiscal year (October start) */
  US_FEDERAL: { startMonth: 10 } as FiscalConfig,
} as const;

/**
 * Format fiscal year as string (e.g., "FY2024" or "FY2023/24")
 * @param fiscalYear - The fiscal year
 * @param config - Fiscal year configuration
 * @param format - Format style: 'short' (FY2024) or 'long' (FY2023/24)
 * @returns Formatted fiscal year string
 */
export function formatFiscalYear(
  fiscalYear: number,
  config: Partial<FiscalConfig> = {},
  format: 'short' | 'long' = 'short'
): string {
  const { startMonth } = { ...DEFAULT_CONFIG, ...config };

  if (format === 'short' || startMonth === 1) {
    return `FY${fiscalYear}`;
  }

  // For non-calendar fiscal years, show both years
  const calendarYearStart = fiscalYear - 1;
  const shortEndYear = fiscalYear.toString().slice(-2);
  return `FY${calendarYearStart}/${shortEndYear}`;
}

/**
 * Format fiscal quarter as string (e.g., "Q1 FY2024")
 * @param fiscalYear - The fiscal year
 * @param quarter - The quarter (1-4)
 * @param config - Fiscal year configuration
 * @returns Formatted fiscal quarter string
 */
export function formatFiscalQuarter(
  fiscalYear: number,
  quarter: number,
  config: Partial<FiscalConfig> = {}
): string {
  const fyString = formatFiscalYear(fiscalYear, config, 'short');
  return `Q${quarter} ${fyString}`;
}

/**
 * Get fiscal period info for a date
 * @param date - The date to analyze
 * @param config - Fiscal year configuration
 * @returns Object with fiscal period information
 */
export function getFiscalPeriodInfo(
  date: Date,
  config: Partial<FiscalConfig> = {}
): {
  fiscalYear: number;
  fiscalQuarter: number;
  fiscalMonth: number;
  fiscalWeek: number;
  daysElapsed: number;
  daysRemaining: number;
  progress: number;
  quarterStart: Date;
  quarterEnd: Date;
  yearStart: Date;
  yearEnd: Date;
} {
  const fiscalYear = getFiscalYear(date, config);
  const fiscalQuarter = getFiscalQuarter(date, config);

  return {
    fiscalYear,
    fiscalQuarter,
    fiscalMonth: getFiscalMonth(date, config),
    fiscalWeek: getFiscalWeek(date, config),
    daysElapsed: getDaysElapsedInFiscalYear(date, config),
    daysRemaining: getDaysRemainingInFiscalYear(date, config),
    progress: getFiscalYearProgress(date, config),
    quarterStart: getFiscalQuarterStart(fiscalYear, fiscalQuarter, config),
    quarterEnd: getFiscalQuarterEnd(fiscalYear, fiscalQuarter, config),
    yearStart: getFiscalYearStart(fiscalYear, config),
    yearEnd: getFiscalYearEnd(fiscalYear, config),
  };
}
