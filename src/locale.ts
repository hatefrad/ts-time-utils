import type { DateInput, SupportedLocale, LocaleConfig, RelativeTimeOptions, RelativeTimeUnit } from './types.js';

/**
 * Internationalization and localization utilities for time formatting
 */

// Default locale configurations
const DEFAULT_LOCALES: Record<string, LocaleConfig> = {
  'en': {
    locale: 'en',
    dateFormats: {
      short: 'M/d/yyyy',
      medium: 'MMM d, yyyy',
      long: 'MMMM d, yyyy',
      full: 'EEEE, MMMM d, yyyy'
    },
    timeFormats: {
      short: 'h:mm a',
      medium: 'h:mm:ss a',
      long: 'h:mm:ss a z',
      full: 'h:mm:ss a zzzz'
    },
    relativeTime: {
      future: 'in {0}',
      past: '{0} ago',
      units: {
        second: 'second',
        seconds: 'seconds',
        minute: 'minute',
        minutes: 'minutes',
        hour: 'hour',
        hours: 'hours',
        day: 'day',
        days: 'days',
        week: 'week',
        weeks: 'weeks',
        month: 'month',
        months: 'months',
        year: 'year',
        years: 'years'
      }
    },
    calendar: {
      weekStartsOn: 0,
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    numbers: {
      decimal: '.',
      thousands: ','
    }
  },
  'es': {
    locale: 'es',
    dateFormats: {
      short: 'd/M/yyyy',
      medium: 'd MMM yyyy',
      long: 'd \'de\' MMMM \'de\' yyyy',
      full: 'EEEE, d \'de\' MMMM \'de\' yyyy'
    },
    timeFormats: {
      short: 'H:mm',
      medium: 'H:mm:ss',
      long: 'H:mm:ss z',
      full: 'H:mm:ss zzzz'
    },
    relativeTime: {
      future: 'en {0}',
      past: 'hace {0}',
      units: {
        second: 'segundo',
        seconds: 'segundos',
        minute: 'minuto',
        minutes: 'minutos',
        hour: 'hora',
        hours: 'horas',
        day: 'día',
        days: 'días',
        week: 'semana',
        weeks: 'semanas',
        month: 'mes',
        months: 'meses',
        year: 'año',
        years: 'años'
      }
    },
    calendar: {
      weekStartsOn: 1,
      monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
      monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
      dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
      dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
    },
    numbers: {
      decimal: ',',
      thousands: '.'
    }
  },
  'fr': {
    locale: 'fr',
    dateFormats: {
      short: 'dd/MM/yyyy',
      medium: 'd MMM yyyy',
      long: 'd MMMM yyyy',
      full: 'EEEE d MMMM yyyy'
    },
    timeFormats: {
      short: 'HH:mm',
      medium: 'HH:mm:ss',
      long: 'HH:mm:ss z',
      full: 'HH:mm:ss zzzz'
    },
    relativeTime: {
      future: 'dans {0}',
      past: 'il y a {0}',
      units: {
        second: 'seconde',
        seconds: 'secondes',
        minute: 'minute',
        minutes: 'minutes',
        hour: 'heure',
        hours: 'heures',
        day: 'jour',
        days: 'jours',
        week: 'semaine',
        weeks: 'semaines',
        month: 'mois',
        months: 'mois',
        year: 'année',
        years: 'années'
      }
    },
    calendar: {
      weekStartsOn: 1,
      monthNames: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
      monthNamesShort: ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'],
      dayNames: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
      dayNamesShort: ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam']
    },
    numbers: {
      decimal: ',',
      thousands: ' '
    }
  },
  'de': {
    locale: 'de',
    dateFormats: {
      short: 'dd.MM.yyyy',
      medium: 'd. MMM yyyy',
      long: 'd. MMMM yyyy',
      full: 'EEEE, d. MMMM yyyy'
    },
    timeFormats: {
      short: 'HH:mm',
      medium: 'HH:mm:ss',
      long: 'HH:mm:ss z',
      full: 'HH:mm:ss zzzz'
    },
    relativeTime: {
      future: 'in {0}',
      past: 'vor {0}',
      units: {
        second: 'Sekunde',
        seconds: 'Sekunden',
        minute: 'Minute',
        minutes: 'Minuten',
        hour: 'Stunde',
        hours: 'Stunden',
        day: 'Tag',
        days: 'Tagen',
        week: 'Woche',
        weeks: 'Wochen',
        month: 'Monat',
        months: 'Monaten',
        year: 'Jahr',
        years: 'Jahren'
      }
    },
    calendar: {
      weekStartsOn: 1,
      monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
      monthNamesShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
      dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
      dayNamesShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
    },
    numbers: {
      decimal: ',',
      thousands: '.'
    }
  },
  'zh': {
    locale: 'zh',
    dateFormats: {
      short: 'yyyy/M/d',
      medium: 'yyyy年M月d日',
      long: 'yyyy年M月d日',
      full: 'yyyy年M月d日 EEEE'
    },
    timeFormats: {
      short: 'H:mm',
      medium: 'H:mm:ss',
      long: 'H:mm:ss z',
      full: 'H:mm:ss zzzz'
    },
    relativeTime: {
      future: '{0}后',
      past: '{0}前',
      units: {
        second: '秒',
        seconds: '秒',
        minute: '分钟',
        minutes: '分钟',
        hour: '小时',
        hours: '小时',
        day: '天',
        days: '天',
        week: '周',
        weeks: '周',
        month: '个月',
        months: '个月',
        year: '年',
        years: '年'
      }
    },
    calendar: {
      weekStartsOn: 1,
      monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    },
    numbers: {
      decimal: '.',
      thousands: ','
    }
  },
  'ja': {
    locale: 'ja',
    dateFormats: {
      short: 'yyyy/MM/dd',
      medium: 'yyyy年M月d日',
      long: 'yyyy年M月d日',
      full: 'yyyy年M月d日 EEEE'
    },
    timeFormats: {
      short: 'H:mm',
      medium: 'H:mm:ss',
      long: 'H:mm:ss z',
      full: 'H:mm:ss zzzz'
    },
    relativeTime: {
      future: '{0}後',
      past: '{0}前',
      units: {
        second: '秒',
        seconds: '秒',
        minute: '分',
        minutes: '分',
        hour: '時間',
        hours: '時間',
        day: '日',
        days: '日',
        week: '週間',
        weeks: '週間',
        month: 'ヶ月',
        months: 'ヶ月',
        year: '年',
        years: '年'
      }
    },
    calendar: {
      weekStartsOn: 0,
      monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
      dayNamesShort: ['日', '月', '火', '水', '木', '金', '土']
    },
    numbers: {
      decimal: '.',
      thousands: ','
    }
  },
  'fa': {
    locale: 'fa',
    dateFormats: {
      short: 'yyyy/M/d',
      medium: 'd MMM yyyy',
      long: 'd MMMM yyyy',
      full: 'EEEE، d MMMM yyyy'
    },
    timeFormats: {
      short: 'H:mm',
      medium: 'H:mm:ss',
      long: 'H:mm:ss z',
      full: 'H:mm:ss zzzz'
    },
    relativeTime: {
      future: '{0} دیگر',
      past: '{0} پیش',
      units: {
        second: 'ثانیه',
        seconds: 'ثانیه',
        minute: 'دقیقه',
        minutes: 'دقیقه',
        hour: 'ساعت',
        hours: 'ساعت',
        day: 'روز',
        days: 'روز',
        week: 'هفته',
        weeks: 'هفته',
        month: 'ماه',
        months: 'ماه',
        year: 'سال',
        years: 'سال'
      }
    },
    calendar: {
      weekStartsOn: 6, // Saturday starts the week in Persian calendar
      monthNames: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
      monthNamesShort: ['فرو', 'ارد', 'خرد', 'تیر', 'مرد', 'شهر', 'مهر', 'آبا', 'آذر', 'دی', 'بهم', 'اسف'],
      dayNames: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'],
      dayNamesShort: ['یک', 'دو', 'سه', 'چهار', 'پنج', 'جمع', 'شنب']
    },
    numbers: {
      decimal: '.',
      thousands: ','
    }
  },
  'nl': {
    locale: 'nl',
    dateFormats: {
      short: 'd-M-yyyy',
      medium: 'd MMM yyyy',
      long: 'd MMMM yyyy',
      full: 'EEEE d MMMM yyyy'
    },
    timeFormats: {
      short: 'HH:mm',
      medium: 'HH:mm:ss',
      long: 'HH:mm:ss z',
      full: 'HH:mm:ss zzzz'
    },
    relativeTime: {
      future: 'over {0}',
      past: '{0} geleden',
      units: {
        second: 'seconde',
        seconds: 'seconden',
        minute: 'minuut',
        minutes: 'minuten',
        hour: 'uur',
        hours: 'uur',
        day: 'dag',
        days: 'dagen',
        week: 'week',
        weeks: 'weken',
        month: 'maand',
        months: 'maanden',
        year: 'jaar',
        years: 'jaar'
      }
    },
    calendar: {
      weekStartsOn: 1, // Monday starts the week in Netherlands
      monthNames: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
      monthNamesShort: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
      dayNames: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
      dayNamesShort: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
    },
    numbers: {
      decimal: ',',
      thousands: '.'
    }
  },
  'it': {
    locale: 'it',
    dateFormats: {
      short: 'dd/MM/yyyy',
      medium: 'd MMM yyyy',
      long: 'd MMMM yyyy',
      full: 'EEEE d MMMM yyyy'
    },
    timeFormats: {
      short: 'HH:mm',
      medium: 'HH:mm:ss',
      long: 'HH:mm:ss z',
      full: 'HH:mm:ss zzzz'
    },
    relativeTime: {
      future: 'tra {0}',
      past: '{0} fa',
      units: {
        second: 'secondo',
        seconds: 'secondi',
        minute: 'minuto',
        minutes: 'minuti',
        hour: 'ora',
        hours: 'ore',
        day: 'giorno',
        days: 'giorni',
        week: 'settimana',
        weeks: 'settimane',
        month: 'mese',
        months: 'mesi',
        year: 'anno',
        years: 'anni'
      }
    },
    calendar: {
      weekStartsOn: 1, // Monday starts the week in Italy
      monthNames: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
      monthNamesShort: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
      dayNames: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
      dayNamesShort: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']
    },
    numbers: {
      decimal: ',',
      thousands: '.'
    }
  }
};

// Global locale registry
const localeRegistry = new Map<string, LocaleConfig>(
  Object.entries(DEFAULT_LOCALES)
);

/**
 * Register a custom locale configuration
 */
export function registerLocale(config: LocaleConfig): void {
  localeRegistry.set(config.locale, config);
  
  // Also register base language if this is a region-specific locale
  const baseLang = config.locale.split('-')[0];
  if (baseLang && baseLang !== config.locale && !localeRegistry.has(baseLang)) {
    localeRegistry.set(baseLang, config);
  }
}

/**
 * Get locale configuration, with fallback to base language or English
 */
export function getLocaleConfig(locale: SupportedLocale): LocaleConfig {
  // Try exact match first
  if (localeRegistry.has(locale)) {
    return localeRegistry.get(locale)!;
  }
  
  // Try base language (e.g., 'en' for 'en-US')
  const baseLang = locale.split('-')[0];
  if (baseLang && localeRegistry.has(baseLang)) {
    return localeRegistry.get(baseLang)!;
  }
  
  // Fallback to English
  return localeRegistry.get('en')!;
}

/**
 * Get list of all registered locales
 */
export function getSupportedLocales(): SupportedLocale[] {
  return Array.from(localeRegistry.keys()) as SupportedLocale[];
}

/**
 * Format relative time in the specified locale
 */
export function formatRelativeTime(
  date: DateInput,
  options: RelativeTimeOptions = {}
): string {
  const {
    locale = 'en',
    maxUnit = 'years',
    minUnit = 'seconds',
    precision = 0,
    short = false,
    numeric = 'always',
    style = 'long'
  } = options;

  const targetDate = normalizeDate(date);
  if (!targetDate) {
    throw new Error('Invalid date provided for relative time formatting');
  }

  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);

  const config = getLocaleConfig(locale);
  const units = getTimeUnits();
  
  // Find the most appropriate unit
  let selectedUnit: RelativeTimeUnit = 'seconds';
  let value = 0;

  // Find maxUnit index to limit our search
  const maxUnitIndex = units.findIndex(u => u.name === maxUnit);
  const minUnitIndex = units.findIndex(u => u.name === minUnit);
  
  // Find the most appropriate unit by iterating from largest to smallest
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const unitValue = absDiffMs / unit.ms;
    
    // Skip units larger than maxUnit
    if (maxUnitIndex >= 0 && i < maxUnitIndex) {
      continue;
    }
    
    // If this unit gives us a value >= 1, use it
    if (unitValue >= 1) {
      const roundedValue = precision > 0 ? 
        parseFloat(unitValue.toFixed(precision)) : 
        Math.round(unitValue);
      selectedUnit = roundedValue === 1 ? unit.singular : unit.plural;
      value = roundedValue;
      break;
    }
    
    // If we've reached the minimum unit, use it even if value < 1
    if (unit.name === minUnit) {
      // For minimum unit, use floor to avoid rounding up very small values
      const flooredValue = precision > 0 ? 
        parseFloat(unitValue.toFixed(precision)) : 
        Math.max(0, Math.floor(unitValue));
      selectedUnit = flooredValue === 1 ? unit.singular : unit.plural;
      value = flooredValue;
      break;
    }
    
    // If we're at the last unit (seconds) and haven't broken yet, use it
    if (i === units.length - 1) {
      // For the last unit (seconds), use floor to be precise
      const flooredValue = precision > 0 ? 
        parseFloat(unitValue.toFixed(precision)) : 
        Math.max(0, Math.floor(unitValue));
      selectedUnit = flooredValue === 1 ? unit.singular : unit.plural;
      value = flooredValue;
      break;
    }
  }

  // Handle special cases for numeric='auto'
  if (numeric === 'auto' && Math.abs(value) <= 1) {
    return getRelativeWords(selectedUnit, isPast, config, locale);
  }

  // Format the number
  const formattedValue = formatNumber(value, config, precision > 0 ? precision : undefined);
  
  // Get unit text
  const unitText = getUnitText(selectedUnit, value, config, short, style);
  
  // Combine value and unit - for Chinese/Japanese, no space between number and unit
  const needsSpace = !short && !['zh', 'ja'].includes(locale.split('-')[0]);
  const combined = needsSpace ? `${formattedValue} ${unitText}` : `${formattedValue}${unitText}`;
  
  // Apply past/future template
  const template = isPast ? config.relativeTime?.past : config.relativeTime?.future;
  return template?.replace('{0}', combined) || combined;
}

/**
 * Format date in locale-specific format
 */
export function formatDateLocale(
  date: DateInput,
  locale: SupportedLocale = 'en',
  style: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
  const targetDate = normalizeDate(date);
  if (!targetDate) {
    throw new Error('Invalid date provided for locale formatting');
  }

  const config = getLocaleConfig(locale);
  const pattern = config.dateFormats?.[style] || config.dateFormats?.medium || 'MMM d, yyyy';
  
  return formatWithPattern(targetDate, pattern, config);
}

/**
 * Format time in locale-specific format
 */
export function formatTimeLocale(
  date: DateInput,
  locale: SupportedLocale = 'en',
  style: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
  const targetDate = normalizeDate(date);
  if (!targetDate) {
    throw new Error('Invalid date provided for time locale formatting');
  }

  const config = getLocaleConfig(locale);
  const pattern = config.timeFormats?.[style] || config.timeFormats?.medium || 'h:mm:ss a';
  
  return formatWithPattern(targetDate, pattern, config);
}

/**
 * Format both date and time in locale-specific format
 */
export function formatDateTimeLocale(
  date: DateInput,
  locale: SupportedLocale = 'en',
  dateStyle: 'short' | 'medium' | 'long' | 'full' = 'medium',
  timeStyle: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
  const dateStr = formatDateLocale(date, locale, dateStyle);
  const timeStr = formatTimeLocale(date, locale, timeStyle);
  
  // Simple concatenation - could be made more sophisticated per locale
  return `${dateStr} ${timeStr}`;
}

/**
 * Get localized month names
 */
export function getMonthNames(
  locale: SupportedLocale = 'en',
  short: boolean = false
): string[] {
  const config = getLocaleConfig(locale);
  return short ? 
    (config.calendar?.monthNamesShort || config.calendar?.monthNames || []) :
    (config.calendar?.monthNames || []);
}

/**
 * Get localized day names
 */
export function getDayNames(
  locale: SupportedLocale = 'en',
  short: boolean = false
): string[] {
  const config = getLocaleConfig(locale);
  return short ? 
    (config.calendar?.dayNamesShort || config.calendar?.dayNames || []) :
    (config.calendar?.dayNames || []);
}

/**
 * Get the first day of week for a locale (0 = Sunday, 1 = Monday, etc.)
 */
export function getFirstDayOfWeek(locale: SupportedLocale = 'en'): number {
  const config = getLocaleConfig(locale);
  return config.calendar?.weekStartsOn ?? 0;
}

/**
 * Check if a locale is supported
 */
export function isLocaleSupported(locale: string): locale is SupportedLocale {
  return localeRegistry.has(locale) || localeRegistry.has(locale.split('-')[0]);
}

/**
 * Get the best matching locale from a list of preferences
 */
export function getBestMatchingLocale(
  preferences: string[],
  fallback: SupportedLocale = 'en'
): SupportedLocale {
  for (const pref of preferences) {
    // Try exact match first
    if (isLocaleSupported(pref)) {
      // If it's a region-specific locale that's not in our registry,
      // but the base language is, return the base language
      if (localeRegistry.has(pref)) {
        return pref as SupportedLocale;
      }
    }
    
    // Try base language
    const baseLang = pref.split('-')[0];
    if (baseLang && baseLang !== pref && isLocaleSupported(baseLang)) {
      return baseLang as SupportedLocale;
    }
  }
  
  return fallback;
}

/**
 * Auto-detect locale from browser or system (if available)
 */
export function detectLocale(fallback: SupportedLocale = 'en'): SupportedLocale {
  // In browser environment
  if (typeof navigator !== 'undefined' && navigator.languages) {
    return getBestMatchingLocale(Array.from(navigator.languages), fallback);
  }
  
  // Single language fallback
  if (typeof navigator !== 'undefined' && navigator.language) {
    return getBestMatchingLocale([navigator.language], fallback);
  }
  
  // Node.js environment
  if (typeof globalThis !== 'undefined' && 
      'process' in globalThis && 
      typeof (globalThis as any).process === 'object' &&
      (globalThis as any).process.env) {
    const env = (globalThis as any).process.env;
    const envLocales = [
      env.LC_ALL,
      env.LC_MESSAGES,
      env.LANG,
      env.LANGUAGE
    ].filter(Boolean).map(loc => loc!.split('.')[0]);
    
    if (envLocales.length > 0) {
      return getBestMatchingLocale(envLocales, fallback);
    }
  }
  
  return fallback;
}

// Helper functions

function normalizeDate(date: DateInput): Date | null {
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }
  
  if (typeof date === 'string' || typeof date === 'number') {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  return null;
}

function getTimeUnits() {
  return [
    { name: 'years', singular: 'year' as RelativeTimeUnit, plural: 'years' as RelativeTimeUnit, ms: 365.25 * 24 * 60 * 60 * 1000 },
    { name: 'months', singular: 'month' as RelativeTimeUnit, plural: 'months' as RelativeTimeUnit, ms: 30.44 * 24 * 60 * 60 * 1000 },
    { name: 'weeks', singular: 'week' as RelativeTimeUnit, plural: 'weeks' as RelativeTimeUnit, ms: 7 * 24 * 60 * 60 * 1000 },
    { name: 'days', singular: 'day' as RelativeTimeUnit, plural: 'days' as RelativeTimeUnit, ms: 24 * 60 * 60 * 1000 },
    { name: 'hours', singular: 'hour' as RelativeTimeUnit, plural: 'hours' as RelativeTimeUnit, ms: 60 * 60 * 1000 },
    { name: 'minutes', singular: 'minute' as RelativeTimeUnit, plural: 'minutes' as RelativeTimeUnit, ms: 60 * 1000 },
    { name: 'seconds', singular: 'second' as RelativeTimeUnit, plural: 'seconds' as RelativeTimeUnit, ms: 1000 }
  ];
}

function formatNumber(value: number, config: LocaleConfig, precision?: number): string {
  let str = value.toString();
  
  // If precision is specified and value is a whole number that should show decimals
  if (precision !== undefined && precision > 0 && Number.isInteger(value)) {
    str = value.toFixed(precision);
  }
  
  const decimal = config.numbers?.decimal || '.';
  const thousands = config.numbers?.thousands || ',';
  
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
  
  return parts.join(decimal);
}

function getUnitText(
  unit: RelativeTimeUnit,
  value: number,
  config: LocaleConfig,
  short: boolean,
  style: string
): string {
  const unitText = config.relativeTime?.units?.[unit] || unit;
  
  if (short || style === 'short') {
    // Return abbreviated form - this could be more sophisticated
    const abbreviations: Record<string, string> = {
      'second': 's', 'seconds': 's',
      'minute': 'm', 'minutes': 'm',
      'hour': 'h', 'hours': 'h',
      'day': 'd', 'days': 'd',
      'week': 'w', 'weeks': 'w',
      'month': 'mo', 'months': 'mo',
      'year': 'y', 'years': 'y'
    };
    return abbreviations[unit] || unitText;
  }
  
  return unitText;
}

function getRelativeWords(
  unit: RelativeTimeUnit,
  isPast: boolean,
  config: LocaleConfig,
  locale: string
): string {
  // Special relative words for common cases
  const specialWords: Record<string, Record<string, { past: string; future: string }>> = {
    'en': {
      'day': { past: 'yesterday', future: 'tomorrow' },
      'days': { past: 'yesterday', future: 'tomorrow' }
    },
    'es': {
      'day': { past: 'ayer', future: 'mañana' },
      'days': { past: 'ayer', future: 'mañana' }
    },
    'fr': {
      'day': { past: 'hier', future: 'demain' },
      'days': { past: 'hier', future: 'demain' }
    },
    'de': {
      'day': { past: 'gestern', future: 'morgen' },
      'days': { past: 'gestern', future: 'morgen' }
    },
    'fa': {
      'day': { past: 'دیروز', future: 'فردا' },
      'days': { past: 'دیروز', future: 'فردا' }
    },
    'nl': {
      'day': { past: 'gisteren', future: 'morgen' },
      'days': { past: 'gisteren', future: 'morgen' }
    },
    'it': {
      'day': { past: 'ieri', future: 'domani' },
      'days': { past: 'ieri', future: 'domani' }
    }
  };
  
  const baseLang = locale.split('-')[0];
  const words = specialWords[baseLang]?.[unit];
  
  if (words) {
    return isPast ? words.past : words.future;
  }
  
  // Fallback to regular format
  const unitText = config.relativeTime?.units?.[unit] || unit;
  const template = isPast ? config.relativeTime?.past : config.relativeTime?.future;
  return template?.replace('{0}', `1 ${unitText}`) || `1 ${unitText}`;
}

function formatWithPattern(date: Date, pattern: string, config: LocaleConfig): string {
  const formatMap: Record<string, string> = {
    'yyyy': date.getFullYear().toString(),
    'MMMM': config.calendar?.monthNames?.[date.getMonth()] || (date.getMonth() + 1).toString(),
    'MMM': config.calendar?.monthNamesShort?.[date.getMonth()] || (date.getMonth() + 1).toString(),
    'MM': (date.getMonth() + 1).toString().padStart(2, '0'),
    'M': (date.getMonth() + 1).toString(),
    'dd': date.getDate().toString().padStart(2, '0'),
    'd': date.getDate().toString(),
    'EEEE': config.calendar?.dayNames?.[date.getDay()] || date.getDay().toString(),
    'HH': date.getHours().toString().padStart(2, '0'),
    'H': date.getHours().toString(),
    'h': ((date.getHours() % 12) || 12).toString(),
    'mm': date.getMinutes().toString().padStart(2, '0'),
    'ss': date.getSeconds().toString().padStart(2, '0'),
    'a': date.getHours() < 12 ? 'AM' : 'PM'
  };

  // Sort by length (longest first) to handle overlapping tokens
  const tokens = Object.keys(formatMap).sort((a, b) => b.length - a.length);
  
  let result = pattern;
  for (const token of tokens) {
    // Replace token only when it appears as a complete token (not part of another)
    // Use a more sophisticated approach to avoid conflicts
    const tokenRegex = new RegExp(`(?<!\\w)${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\w)`, 'g');
    result = result.replace(tokenRegex, formatMap[token]);
  }

  return result;
}

// ========================================
// LOCALE CONVERSION UTILITIES
// ========================================

/**
 * Convert a relative time string from one locale to another
 * Attempts to parse the relative time and reformat in target locale
 */
export function convertRelativeTime(
  relativeTimeString: string,
  fromLocale: SupportedLocale,
  toLocale: SupportedLocale
): string | null {
  if (fromLocale === toLocale) {
    return relativeTimeString;
  }

  const parsedTime = parseRelativeTime(relativeTimeString, fromLocale);
  if (!parsedTime) {
    return null;
  }

  return formatRelativeTime(parsedTime.date, { 
    locale: toLocale,
    maxUnit: parsedTime.unit,
    precision: parsedTime.precision,
    short: parsedTime.isShort,
    numeric: parsedTime.numeric
  });
}

/**
 * Detect the locale of a formatted relative time string
 * Returns the most likely locale or null if detection fails
 */
export function detectLocaleFromRelativeTime(relativeTimeString: string): SupportedLocale | null {
  const supportedLocales = getSupportedLocales();
  
  for (const locale of supportedLocales) {
    if (parseRelativeTime(relativeTimeString, locale)) {
      return locale;
    }
  }
  
  return null;
}

/**
 * Convert a date format pattern from one locale's convention to another
 */
export function convertFormatPattern(
  pattern: string,
  fromLocale: SupportedLocale,
  toLocale: SupportedLocale,
  style?: 'short' | 'medium' | 'long' | 'full'
): string {
  if (fromLocale === toLocale) {
    return pattern;
  }

  const toConfig = getLocaleConfig(toLocale);
  
  // If style is specified, return the target locale's pattern for that style
  if (style && toConfig.dateFormats?.[style]) {
    return toConfig.dateFormats[style];
  }

  // Try to map common patterns between locales
  const patternMappings: Record<string, Record<string, string>> = {
    'en': {
      'M/d/yyyy': 'short',
      'MMM d, yyyy': 'medium',
      'MMMM d, yyyy': 'long',
      'EEEE, MMMM d, yyyy': 'full'
    },
    'es': {
      'd/M/yyyy': 'short',
      'd MMM yyyy': 'medium', 
      'd \'de\' MMMM \'de\' yyyy': 'long',
      'EEEE, d \'de\' MMMM \'de\' yyyy': 'full'
    },
    'fr': {
      'dd/MM/yyyy': 'short',
      'd MMM yyyy': 'medium',
      'd MMMM yyyy': 'long',
      'EEEE d MMMM yyyy': 'full'
    },
    'de': {
      'd.M.yyyy': 'short',
      'd. MMM yyyy': 'medium',
      'd. MMMM yyyy': 'long',
      'EEEE, d. MMMM yyyy': 'full'
    }
  };

  // Find matching style from source pattern
  const fromMappings = patternMappings[fromLocale];
  if (fromMappings) {
    const matchedStyle = fromMappings[pattern];
    if (matchedStyle && toConfig.dateFormats?.[matchedStyle as keyof typeof toConfig.dateFormats]) {
      return toConfig.dateFormats[matchedStyle as keyof typeof toConfig.dateFormats]!;
    }
  }

  // Fallback: return target locale's medium format
  return toConfig.dateFormats?.medium || pattern;
}

/**
 * Convert a formatted date string from one locale to another
 * Attempts to parse the date and reformat in target locale
 */
export function convertFormattedDate(
  formattedDate: string,
  fromLocale: SupportedLocale,
  toLocale: SupportedLocale,
  targetStyle?: 'short' | 'medium' | 'long' | 'full'
): string | null {
  if (fromLocale === toLocale) {
    return formattedDate;
  }

  const parsedDate = parseFormattedDate(formattedDate, fromLocale);
  if (!parsedDate) {
    return null;
  }

  return formatDateLocale(parsedDate, toLocale, targetStyle || 'medium');
}

/**
 * Bulk convert an array of relative time strings to a different locale
 */
export function convertRelativeTimeArray(
  relativeTimeStrings: string[],
  fromLocale: SupportedLocale,
  toLocale: SupportedLocale
): (string | null)[] {
  return relativeTimeStrings.map(str => convertRelativeTime(str, fromLocale, toLocale));
}

/**
 * Get format pattern differences between two locales
 */
export function compareLocaleFormats(
  locale1: SupportedLocale,
  locale2: SupportedLocale
): {
  dateFormats: Record<string, { locale1: string; locale2: string }>;
  timeFormats: Record<string, { locale1: string; locale2: string }>;
  weekStartsOn: { locale1: number; locale2: number };
} {
  const config1 = getLocaleConfig(locale1);
  const config2 = getLocaleConfig(locale2);

  const result = {
    dateFormats: {} as Record<string, { locale1: string; locale2: string }>,
    timeFormats: {} as Record<string, { locale1: string; locale2: string }>,
    weekStartsOn: { 
      locale1: config1.calendar?.weekStartsOn || 0, 
      locale2: config2.calendar?.weekStartsOn || 0 
    }
  };

  // Compare date formats
  const styles = ['short', 'medium', 'long', 'full'] as const;
  for (const style of styles) {
    if (config1.dateFormats?.[style] || config2.dateFormats?.[style]) {
      result.dateFormats[style] = {
        locale1: config1.dateFormats?.[style] || 'N/A',
        locale2: config2.dateFormats?.[style] || 'N/A'
      };
    }
  }

  // Compare time formats
  for (const style of styles) {
    if (config1.timeFormats?.[style] || config2.timeFormats?.[style]) {
      result.timeFormats[style] = {
        locale1: config1.timeFormats?.[style] || 'N/A',
        locale2: config2.timeFormats?.[style] || 'N/A'
      };
    }
  }

  return result;
}

// ========================================
// HELPER FUNCTIONS FOR CONVERSIONS
// ========================================

/**
 * Parse a relative time string and extract its components
 */
function parseRelativeTime(
  relativeTimeString: string,
  locale: SupportedLocale
): {
  date: Date;
  unit: RelativeTimeUnit;
  precision: number;
  isShort: boolean;
  numeric: 'always' | 'auto';
} | null {
  const config = getLocaleConfig(locale);
  const trimmed = relativeTimeString.trim();
  
  // Try simple patterns first: "2 hours ago", "hace 2 horas", etc.
  const pastTemplate = config.relativeTime?.past || '{0} ago';
  const futureTemplate = config.relativeTime?.future || 'in {0}';
  
  // Check if it matches past pattern
  const pastPrefix = pastTemplate.split('{0}')[0];
  const pastSuffix = pastTemplate.split('{0}')[1] || '';
  const futurePrefix = futureTemplate.split('{0}')[0];
  const futureSuffix = futureTemplate.split('{0}')[1] || '';
  
  let valueAndUnit = '';
  let isPast = false;
  
  // Try to extract the value and unit part
  if (pastPrefix && trimmed.startsWith(pastPrefix.trim())) {
    const remaining = trimmed.substring(pastPrefix.trim().length).trim();
    if (!pastSuffix || remaining.endsWith(pastSuffix.trim())) {
      valueAndUnit = pastSuffix ? remaining.substring(0, remaining.length - pastSuffix.trim().length).trim() : remaining;
      isPast = true;
    }
  } else if (pastSuffix && trimmed.endsWith(pastSuffix.trim())) {
    const remaining = trimmed.substring(0, trimmed.length - pastSuffix.trim().length).trim();
    if (!pastPrefix || remaining.startsWith(pastPrefix.trim())) {
      valueAndUnit = pastPrefix ? remaining.substring(pastPrefix.trim().length).trim() : remaining;
      isPast = true;
    }
  } else if (futurePrefix && trimmed.startsWith(futurePrefix.trim())) {
    const remaining = trimmed.substring(futurePrefix.trim().length).trim();
    if (!futureSuffix || remaining.endsWith(futureSuffix.trim())) {
      valueAndUnit = futureSuffix ? remaining.substring(0, remaining.length - futureSuffix.trim().length).trim() : remaining;
      isPast = false;
    }
  } else if (futureSuffix && trimmed.endsWith(futureSuffix.trim())) {
    const remaining = trimmed.substring(0, trimmed.length - futureSuffix.trim().length).trim();
    if (!futurePrefix || remaining.startsWith(futurePrefix.trim())) {
      valueAndUnit = futurePrefix ? remaining.substring(futurePrefix.trim().length).trim() : remaining;
      isPast = false;
    }
  }
  
  if (!valueAndUnit) return null;

  // Extract number and unit from something like "2 hours" or "2h"
  const match = valueAndUnit.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
  if (!match) return null;
  
  const value = parseFloat(match[1]);
  const unitText = match[2].trim();
  
  if (isNaN(value)) return null;

  // Find matching unit
  const unit = findRelativeTimeUnit(unitText, config);
  if (!unit) return null;

  // Calculate the date
  const now = new Date();
  const unitMs = getUnitMilliseconds(unit);
  const offsetMs = value * unitMs * (isPast ? -1 : 1);
  const date = new Date(now.getTime() + offsetMs);

  return {
    date,
    unit,
    precision: value % 1 === 0 ? 0 : 1,
    isShort: unitText.length <= 2, // heuristic for short format like "h", "m", "d"
    numeric: 'always' as const
  };
}

/**
 * Parse a formatted date string using locale-specific patterns
 */
function parseFormattedDate(formattedDate: string, locale: SupportedLocale): Date | null {
  const config = getLocaleConfig(locale);
  const trimmed = formattedDate.trim();

  // Try different date format patterns
  const patterns = Object.values(config.dateFormats || {});
  
  for (const pattern of patterns) {
    const date = tryParseWithPattern(trimmed, pattern, config);
    if (date) {
      return date;
    }
  }

  return null;
}

/**
 * Find a RelativeTimeUnit from unit text
 */
function findRelativeTimeUnit(unitText: string, config: LocaleConfig): RelativeTimeUnit | null {
  const units = config.relativeTime?.units;
  if (!units) return null;

  // Check exact matches first
  for (const [key, value] of Object.entries(units)) {
    if (value === unitText) {
      return key as RelativeTimeUnit;
    }
  }

  // Check abbreviations for English and other common cases
  const abbreviations: Record<string, RelativeTimeUnit> = {
    // English abbreviations
    's': 'seconds',
    'sec': 'seconds',
    'secs': 'seconds',
    'm': 'minutes',
    'min': 'minutes',
    'mins': 'minutes',
    'h': 'hours',
    'hr': 'hours',
    'hrs': 'hours',
    'd': 'days',
    'day': 'day',
    'days': 'days',
    'w': 'weeks',
    'wk': 'weeks',
    'wks': 'weeks',
    'mo': 'months',
    'mos': 'months',
    'y': 'years',
    'yr': 'years',
    'yrs': 'years',
    // Persian abbreviations
    'ث': 'seconds',
    'د': 'minutes',
    'س': 'hours',
    'ر': 'days',
    'ه': 'weeks',
    'م': 'months',
    'ل': 'years'
  };

  return abbreviations[unitText] || null;
}

/**
 * Get milliseconds for a time unit
 */
function getUnitMilliseconds(unit: RelativeTimeUnit): number {
  const unitMap: Record<string, number> = {
    'second': 1000,
    'seconds': 1000,
    'minute': 60 * 1000,
    'minutes': 60 * 1000,
    'hour': 60 * 60 * 1000,
    'hours': 60 * 60 * 1000,
    'day': 24 * 60 * 60 * 1000,
    'days': 24 * 60 * 60 * 1000,
    'week': 7 * 24 * 60 * 60 * 1000,
    'weeks': 7 * 24 * 60 * 60 * 1000,
    'month': 30.44 * 24 * 60 * 60 * 1000,
    'months': 30.44 * 24 * 60 * 60 * 1000,
    'year': 365.25 * 24 * 60 * 60 * 1000,
    'years': 365.25 * 24 * 60 * 60 * 1000
  };

  return unitMap[unit] || 1000;
}

/**
 * Try to parse a date string with a specific pattern
 */
function tryParseWithPattern(dateString: string, pattern: string, config: LocaleConfig): Date | null {
  // This is a simplified parser - could be made more sophisticated
  // For now, try common patterns
  
  if (pattern === 'M/d/yyyy' || pattern === 'd/M/yyyy') {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [first, second, year] = parts.map(p => parseInt(p, 10));
      if (!isNaN(first) && !isNaN(second) && !isNaN(year)) {
        const month = pattern === 'M/d/yyyy' ? first - 1 : second - 1;
        const day = pattern === 'M/d/yyyy' ? second : first;
        return new Date(year, month, day);
      }
    }
  }

  // Try ISO date parsing as fallback
  const isoDate = new Date(dateString);
  return isNaN(isoDate.getTime()) ? null : isoDate;
}