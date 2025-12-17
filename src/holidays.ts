/**
 * @fileoverview International holiday utilities
 * Calculate holidays for multiple countries including fixed, movable, and lunar-based holidays
 */

export type CountryCode = 'UK' | 'NL' | 'DE' | 'CA' | 'AU' | 'IT' | 'ES' | 'CN' | 'IN' | 'US';

export interface Holiday {
  name: string;
  date: Date;
  countryCode: CountryCode;
  type: 'public' | 'bank' | 'observance';
}

/**
 * Calculate Easter Sunday using the Anonymous Gregorian algorithm
 * @param year - The year
 * @returns Date of Easter Sunday
 */
function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Get nth occurrence of a weekday in a month
 */
function getNthWeekdayOfMonth(year: number, month: number, dayOfWeek: number, n: number): Date {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  let dayOffset = dayOfWeek - firstWeekday;
  if (dayOffset < 0) dayOffset += 7;
  const date = 1 + dayOffset + (n - 1) * 7;
  return new Date(year, month, date);
}

/**
 * Get last occurrence of a weekday in a month
 */
function getLastWeekdayOfMonth(year: number, month: number, dayOfWeek: number): Date {
  const lastDay = new Date(year, month + 1, 0);
  const lastDate = lastDay.getDate();
  const lastWeekday = lastDay.getDay();
  
  let diff = lastWeekday - dayOfWeek;
  if (diff < 0) diff += 7;
  
  return new Date(year, month, lastDate - diff);
}

/**
 * Adjust date if it falls on a weekend (move to Monday)
 */
function adjustForWeekend(date: Date): Date {
  const day = date.getDay();
  if (day === 0) { // Sunday
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  } else if (day === 6) { // Saturday
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2);
  }
  return date;
}

// ============================================================================
// UK HOLIDAYS
// ============================================================================

export function getUKHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];

  // New Year's Day (or substitute)
  holidays.push({
    name: "New Year's Day",
    date: adjustForWeekend(new Date(year, 0, 1)),
    countryCode: 'UK',
    type: 'bank'
  });

  // Good Friday (Easter - 2 days)
  const easter = getEasterSunday(year);
  holidays.push({
    name: 'Good Friday',
    date: new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 2),
    countryCode: 'UK',
    type: 'bank'
  });

  // Easter Monday (Easter + 1 day)
  holidays.push({
    name: 'Easter Monday',
    date: new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 1),
    countryCode: 'UK',
    type: 'bank'
  });

  // Early May Bank Holiday (first Monday in May)
  holidays.push({
    name: 'Early May Bank Holiday',
    date: getNthWeekdayOfMonth(year, 4, 1, 1),
    countryCode: 'UK',
    type: 'bank'
  });

  // Spring Bank Holiday (last Monday in May)
  holidays.push({
    name: 'Spring Bank Holiday',
    date: getLastWeekdayOfMonth(year, 4, 1),
    countryCode: 'UK',
    type: 'bank'
  });

  // Summer Bank Holiday (last Monday in August)
  holidays.push({
    name: 'Summer Bank Holiday',
    date: getLastWeekdayOfMonth(year, 7, 1),
    countryCode: 'UK',
    type: 'bank'
  });

  // Christmas Day
  holidays.push({
    name: 'Christmas Day',
    date: adjustForWeekend(new Date(year, 11, 25)),
    countryCode: 'UK',
    type: 'bank'
  });

  // Boxing Day
  const christmas = new Date(year, 11, 25);
  let boxingDay = new Date(year, 11, 26);
  if (christmas.getDay() === 6) { // Christmas on Saturday
    boxingDay = new Date(year, 11, 28); // Monday
  } else if (christmas.getDay() === 0) { // Christmas on Sunday
    boxingDay = new Date(year, 11, 27); // Tuesday (Monday is Christmas substitute)
  } else {
    boxingDay = adjustForWeekend(boxingDay);
  }
  
  holidays.push({
    name: 'Boxing Day',
    date: boxingDay,
    countryCode: 'UK',
    type: 'bank'
  });

  return holidays;
}

// ============================================================================
// NETHERLANDS HOLIDAYS
// ============================================================================

export function getNetherlandsHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];
  const easter = getEasterSunday(year);

  // New Year's Day
  holidays.push({
    name: "New Year's Day",
    date: new Date(year, 0, 1),
    countryCode: 'NL',
    type: 'public'
  });

  // Good Friday
  holidays.push({
    name: 'Good Friday',
    date: new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 2),
    countryCode: 'NL',
    type: 'observance'
  });

  // Easter Sunday
  holidays.push({
    name: 'Easter Sunday',
    date: easter,
    countryCode: 'NL',
    type: 'public'
  });

  // Easter Monday
  holidays.push({
    name: 'Easter Monday',
    date: new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 1),
    countryCode: 'NL',
    type: 'public'
  });

  // King's Day (April 27, or 26 if 27th is Sunday)
  const kingsDay = new Date(year, 3, 27);
  if (kingsDay.getDay() === 0) {
    holidays.push({
      name: "King's Day",
      date: new Date(year, 3, 26),
      countryCode: 'NL',
      type: 'public'
    });
  } else {
    holidays.push({
      name: "King's Day",
      date: kingsDay,
      countryCode: 'NL',
      type: 'public'
    });
  }

  // Liberation Day (May 5)
  holidays.push({
    name: 'Liberation Day',
    date: new Date(year, 4, 5),
    countryCode: 'NL',
    type: 'public'
  });

  // Ascension Day (Easter + 39 days)
  holidays.push({
    name: 'Ascension Day',
    date: new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 39),
    countryCode: 'NL',
    type: 'public'
  });

  // Whit Sunday (Easter + 49 days)
  holidays.push({
    name: 'Whit Sunday',
    date: new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 49),
    countryCode: 'NL',
    type: 'public'
  });

  // Whit Monday (Easter + 50 days)
  holidays.push({
    name: 'Whit Monday',
    date: new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 50),
    countryCode: 'NL',
    type: 'public'
  });

  // Christmas Day
  holidays.push({
    name: 'Christmas Day',
    date: new Date(year, 11, 25),
    countryCode: 'NL',
    type: 'public'
  });

  // Boxing Day
  holidays.push({
    name: 'Boxing Day',
    date: new Date(year, 11, 26),
    countryCode: 'NL',
    type: 'public'
  });

  return holidays;
}

// ============================================================================
// GERMANY HOLIDAYS
// ============================================================================

export function getGermanyHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];
  const easter = getEasterSunday(year);

  // New Year's Day
  holidays.push({
    name: "New Year's Day",
    date: new Date(year, 0, 1),
    countryCode: 'DE',
    type: 'public'
  });

  // Good Friday
  holidays.push({
    name: 'Good Friday',
    date: new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 2),
    countryCode: 'DE',
    type: 'public'
  });

  // Easter Monday
  holidays.push({
    name: 'Easter Monday',
    date: new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 1),
    countryCode: 'DE',
    type: 'public'
  });

  // Labour Day
  holidays.push({
    name: 'Labour Day',
    date: new Date(year, 4, 1),
    countryCode: 'DE',
    type: 'public'
  });

  // Ascension Day
  holidays.push({
    name: 'Ascension Day',
    date: new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 39),
    countryCode: 'DE',
    type: 'public'
  });

  // Whit Monday
  holidays.push({
    name: 'Whit Monday',
    date: new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 50),
    countryCode: 'DE',
    type: 'public'
  });

  // German Unity Day
  holidays.push({
    name: 'German Unity Day',
    date: new Date(year, 9, 3),
    countryCode: 'DE',
    type: 'public'
  });

  // Christmas Day
  holidays.push({
    name: 'Christmas Day',
    date: new Date(year, 11, 25),
    countryCode: 'DE',
    type: 'public'
  });

  // Boxing Day
  holidays.push({
    name: 'Boxing Day',
    date: new Date(year, 11, 26),
    countryCode: 'DE',
    type: 'public'
  });

  return holidays;
}

// ============================================================================
// CANADA HOLIDAYS
// ============================================================================

export function getCanadaHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];
  const easter = getEasterSunday(year);

  // New Year's Day
  holidays.push({
    name: "New Year's Day",
    date: adjustForWeekend(new Date(year, 0, 1)),
    countryCode: 'CA',
    type: 'public'
  });

  // Good Friday
  holidays.push({
    name: 'Good Friday',
    date: new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 2),
    countryCode: 'CA',
    type: 'public'
  });

  // Victoria Day (Monday before May 25)
  const may24 = new Date(year, 4, 24);
  const victoriaDay = new Date(year, 4, 24 - ((may24.getDay() + 6) % 7));
  holidays.push({
    name: 'Victoria Day',
    date: victoriaDay,
    countryCode: 'CA',
    type: 'public'
  });

  // Canada Day (July 1, or substitute)
  holidays.push({
    name: 'Canada Day',
    date: adjustForWeekend(new Date(year, 6, 1)),
    countryCode: 'CA',
    type: 'public'
  });

  // Labour Day (first Monday in September)
  holidays.push({
    name: 'Labour Day',
    date: getNthWeekdayOfMonth(year, 8, 1, 1),
    countryCode: 'CA',
    type: 'public'
  });

  // Thanksgiving (second Monday in October)
  holidays.push({
    name: 'Thanksgiving',
    date: getNthWeekdayOfMonth(year, 9, 1, 2),
    countryCode: 'CA',
    type: 'public'
  });

  // Remembrance Day
  holidays.push({
    name: 'Remembrance Day',
    date: new Date(year, 10, 11),
    countryCode: 'CA',
    type: 'public'
  });

  // Christmas Day
  holidays.push({
    name: 'Christmas Day',
    date: adjustForWeekend(new Date(year, 11, 25)),
    countryCode: 'CA',
    type: 'public'
  });

  // Boxing Day
  holidays.push({
    name: 'Boxing Day',
    date: adjustForWeekend(new Date(year, 11, 26)),
    countryCode: 'CA',
    type: 'public'
  });

  return holidays;
}

// ============================================================================
// AUSTRALIA HOLIDAYS
// ============================================================================

export function getAustraliaHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];
  const easter = getEasterSunday(year);

  // New Year's Day
  holidays.push({
    name: "New Year's Day",
    date: adjustForWeekend(new Date(year, 0, 1)),
    countryCode: 'AU',
    type: 'public'
  });

  // Australia Day (January 26)
  holidays.push({
    name: 'Australia Day',
    date: adjustForWeekend(new Date(year, 0, 26)),
    countryCode: 'AU',
    type: 'public'
  });

  // Good Friday
  holidays.push({
    name: 'Good Friday',
    date: new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 2),
    countryCode: 'AU',
    type: 'public'
  });

  // Easter Saturday
  holidays.push({
    name: 'Easter Saturday',
    date: new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 1),
    countryCode: 'AU',
    type: 'public'
  });

  // Easter Monday
  holidays.push({
    name: 'Easter Monday',
    date: new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 1),
    countryCode: 'AU',
    type: 'public'
  });

  // Anzac Day (April 25)
  holidays.push({
    name: 'Anzac Day',
    date: new Date(year, 3, 25),
    countryCode: 'AU',
    type: 'public'
  });

  // Queen's Birthday (second Monday in June)
  holidays.push({
    name: "Queen's Birthday",
    date: getNthWeekdayOfMonth(year, 5, 1, 2),
    countryCode: 'AU',
    type: 'public'
  });

  // Christmas Day
  holidays.push({
    name: 'Christmas Day',
    date: adjustForWeekend(new Date(year, 11, 25)),
    countryCode: 'AU',
    type: 'public'
  });

  // Boxing Day
  holidays.push({
    name: 'Boxing Day',
    date: adjustForWeekend(new Date(year, 11, 26)),
    countryCode: 'AU',
    type: 'public'
  });

  return holidays;
}

// ============================================================================
// ITALY HOLIDAYS
// ============================================================================

export function getItalyHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];
  const easter = getEasterSunday(year);

  // New Year's Day
  holidays.push({
    name: "New Year's Day",
    date: new Date(year, 0, 1),
    countryCode: 'IT',
    type: 'public'
  });

  // Epiphany
  holidays.push({
    name: 'Epiphany',
    date: new Date(year, 0, 6),
    countryCode: 'IT',
    type: 'public'
  });

  // Easter Monday
  holidays.push({
    name: 'Easter Monday',
    date: new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 1),
    countryCode: 'IT',
    type: 'public'
  });

  // Liberation Day
  holidays.push({
    name: 'Liberation Day',
    date: new Date(year, 3, 25),
    countryCode: 'IT',
    type: 'public'
  });

  // Labour Day
  holidays.push({
    name: 'Labour Day',
    date: new Date(year, 4, 1),
    countryCode: 'IT',
    type: 'public'
  });

  // Republic Day
  holidays.push({
    name: 'Republic Day',
    date: new Date(year, 5, 2),
    countryCode: 'IT',
    type: 'public'
  });

  // Assumption of Mary
  holidays.push({
    name: 'Assumption of Mary',
    date: new Date(year, 7, 15),
    countryCode: 'IT',
    type: 'public'
  });

  // All Saints' Day
  holidays.push({
    name: "All Saints' Day",
    date: new Date(year, 10, 1),
    countryCode: 'IT',
    type: 'public'
  });

  // Immaculate Conception
  holidays.push({
    name: 'Immaculate Conception',
    date: new Date(year, 11, 8),
    countryCode: 'IT',
    type: 'public'
  });

  // Christmas Day
  holidays.push({
    name: 'Christmas Day',
    date: new Date(year, 11, 25),
    countryCode: 'IT',
    type: 'public'
  });

  // St. Stephen's Day
  holidays.push({
    name: "St. Stephen's Day",
    date: new Date(year, 11, 26),
    countryCode: 'IT',
    type: 'public'
  });

  return holidays;
}

// ============================================================================
// SPAIN HOLIDAYS
// ============================================================================

export function getSpainHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];
  const easter = getEasterSunday(year);

  // New Year's Day
  holidays.push({
    name: "New Year's Day",
    date: new Date(year, 0, 1),
    countryCode: 'ES',
    type: 'public'
  });

  // Epiphany
  holidays.push({
    name: 'Epiphany',
    date: new Date(year, 0, 6),
    countryCode: 'ES',
    type: 'public'
  });

  // Good Friday
  holidays.push({
    name: 'Good Friday',
    date: new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 2),
    countryCode: 'ES',
    type: 'public'
  });

  // Labour Day
  holidays.push({
    name: 'Labour Day',
    date: new Date(year, 4, 1),
    countryCode: 'ES',
    type: 'public'
  });

  // Assumption of Mary
  holidays.push({
    name: 'Assumption of Mary',
    date: new Date(year, 7, 15),
    countryCode: 'ES',
    type: 'public'
  });

  // National Day of Spain
  holidays.push({
    name: 'National Day of Spain',
    date: new Date(year, 9, 12),
    countryCode: 'ES',
    type: 'public'
  });

  // All Saints' Day
  holidays.push({
    name: "All Saints' Day",
    date: new Date(year, 10, 1),
    countryCode: 'ES',
    type: 'public'
  });

  // Constitution Day
  holidays.push({
    name: 'Constitution Day',
    date: new Date(year, 11, 6),
    countryCode: 'ES',
    type: 'public'
  });

  // Immaculate Conception
  holidays.push({
    name: 'Immaculate Conception',
    date: new Date(year, 11, 8),
    countryCode: 'ES',
    type: 'public'
  });

  // Christmas Day
  holidays.push({
    name: 'Christmas Day',
    date: new Date(year, 11, 25),
    countryCode: 'ES',
    type: 'public'
  });

  return holidays;
}

// ============================================================================
// CHINA HOLIDAYS (Simplified - some are lunar calendar based)
// ============================================================================

export function getChinaHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];

  // New Year's Day
  holidays.push({
    name: "New Year's Day",
    date: new Date(year, 0, 1),
    countryCode: 'CN',
    type: 'public'
  });

  // Note: Spring Festival (Chinese New Year) is lunar calendar based
  // This is a simplified version - actual dates vary by year
  // Would need a lunar calendar library for accurate dates

  // Tomb Sweeping Day (April 4 or 5)
  holidays.push({
    name: 'Tomb Sweeping Day',
    date: new Date(year, 3, 4),
    countryCode: 'CN',
    type: 'public'
  });

  // Labour Day
  holidays.push({
    name: 'Labour Day',
    date: new Date(year, 4, 1),
    countryCode: 'CN',
    type: 'public'
  });

  // Dragon Boat Festival (lunar calendar - approximate)
  // Note: Actual date varies, this is simplified

  // Mid-Autumn Festival (lunar calendar - approximate)
  // Note: Actual date varies, this is simplified

  // National Day
  holidays.push({
    name: 'National Day',
    date: new Date(year, 9, 1),
    countryCode: 'CN',
    type: 'public'
  });

  return holidays;
}

// ============================================================================
// INDIA HOLIDAYS (Simplified - many are lunar calendar based)
// ============================================================================

export function getIndiaHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];

  // Republic Day
  holidays.push({
    name: 'Republic Day',
    date: new Date(year, 0, 26),
    countryCode: 'IN',
    type: 'public'
  });

  // Independence Day
  holidays.push({
    name: 'Independence Day',
    date: new Date(year, 7, 15),
    countryCode: 'IN',
    type: 'public'
  });

  // Gandhi Jayanti
  holidays.push({
    name: 'Gandhi Jayanti',
    date: new Date(year, 9, 2),
    countryCode: 'IN',
    type: 'public'
  });

  // Note: Diwali, Holi, Eid, etc. are lunar calendar based
  // Would need a lunar calendar library for accurate dates

  return holidays;
}

// ============================================================================
// UNIFIED API
// ============================================================================

/**
 * Get holidays for a specific country and year
 * @param year - The year
 * @param countryCode - ISO country code
 * @returns Array of holidays
 */
export function getHolidays(year: number, countryCode: CountryCode): Holiday[] {
  switch (countryCode) {
    case 'UK':
      return getUKHolidays(year);
    case 'NL':
      return getNetherlandsHolidays(year);
    case 'DE':
      return getGermanyHolidays(year);
    case 'CA':
      return getCanadaHolidays(year);
    case 'AU':
      return getAustraliaHolidays(year);
    case 'IT':
      return getItalyHolidays(year);
    case 'ES':
      return getSpainHolidays(year);
    case 'CN':
      return getChinaHolidays(year);
    case 'IN':
      return getIndiaHolidays(year);
    case 'US':
      // Import from existing calendar module
      return [];
    default:
      return [];
  }
}

/**
 * Check if a date is a holiday in a specific country
 * @param date - The date to check
 * @param countryCode - ISO country code
 * @returns True if date is a holiday
 */
export function isHoliday(date: Date, countryCode: CountryCode): boolean {
  const holidays = getHolidays(date.getFullYear(), countryCode);
  // Normalize to local date components for comparison
  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth();
  const targetDay = date.getDate();
  
  return holidays.some(h => 
    h.date.getFullYear() === targetYear &&
    h.date.getMonth() === targetMonth &&
    h.date.getDate() === targetDay
  );
}

/**
 * Get the holiday name for a specific date and country
 * @param date - The date to check
 * @param countryCode - ISO country code
 * @returns Holiday name or null if not a holiday
 */
export function getHolidayName(date: Date, countryCode: CountryCode): string | null {
  const holidays = getHolidays(date.getFullYear(), countryCode);
  // Normalize to local date components for comparison
  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth();
  const targetDay = date.getDate();
  
  const holiday = holidays.find(h => 
    h.date.getFullYear() === targetYear &&
    h.date.getMonth() === targetMonth &&
    h.date.getDate() === targetDay
  );
  return holiday ? holiday.name : null;
}

/**
 * Get next holiday from a given date
 * @param date - The reference date
 * @param countryCode - ISO country code
 * @returns Next holiday or null
 */
export function getNextHoliday(date: Date, countryCode: CountryCode): Holiday | null {
  const year = date.getFullYear();
  let holidays = getHolidays(year, countryCode);
  
  // Also get next year's holidays
  holidays = [...holidays, ...getHolidays(year + 1, countryCode)];
  
  const future = holidays
    .filter(h => h.date > date)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return future[0] || null;
}

/**
 * Get upcoming holidays within N days
 * @param date - The reference date
 * @param days - Number of days to look ahead
 * @param countryCode - ISO country code
 * @returns Array of upcoming holidays
 */
export function getUpcomingHolidays(
  date: Date,
  days: number,
  countryCode: CountryCode
): Holiday[] {
  const year = date.getFullYear();
  let holidays = getHolidays(year, countryCode);
  
  // Also get next year's holidays
  holidays = [...holidays, ...getHolidays(year + 1, countryCode)];
  
  const maxDate = new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  
  return holidays
    .filter(h => h.date > date && h.date <= maxDate)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Get all supported country codes
 * @returns Array of country codes
 */
export function getSupportedCountries(): CountryCode[] {
  return ['UK', 'NL', 'DE', 'CA', 'AU', 'IT', 'ES', 'CN', 'IN', 'US'];
}
