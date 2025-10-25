/**
 * @fileoverview Natural language date parsing utilities
 * Provides intelligent parsing of human-readable date strings
 */

import { addTime } from './calculate.js';
import { parseRelativeDate } from './parse.js';

/**
 * Options for natural language parsing
 */
export interface NaturalParseOptions {
  /** Reference date for relative parsing (defaults to now) */
  referenceDate?: Date;
  /** Preferred time for dates without time specified */
  defaultTime?: { hour: number; minute: number; second?: number };
  /** Locale for language-specific parsing */
  locale?: string;
  /** Whether to use strict parsing */
  strict?: boolean;
}

/**
 * Extracted date information from text
 */
export interface ExtractedDate {
  /** The parsed date */
  date: Date;
  /** The original text that was matched */
  text: string;
  /** Starting position in the original text */
  index: number;
  /** Type of date pattern matched */
  type: 'absolute' | 'relative' | 'range' | 'time';
  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Parses natural language date strings into Date objects
 * @param input - Natural language date string
 * @param options - Parsing options
 * @returns Parsed date or null if unable to parse
 * 
 * @example
 * ```ts
 * parseNaturalDate('tomorrow at 3pm');
 * // Date for tomorrow at 15:00
 * 
 * parseNaturalDate('next Friday');
 * // Date for next Friday
 * 
 * parseNaturalDate('in 2 weeks');
 * // Date 2 weeks from now
 * 
 * parseNaturalDate('December 25th');
 * // Date for Dec 25 this year (or next if passed)
 * ```
 */
export function parseNaturalDate(input: string, options: NaturalParseOptions = {}): Date | null {
  const { referenceDate = new Date(), defaultTime } = options;
  const normalized = input.toLowerCase().trim();
  
  // Try existing relative date parser first
  const relativeResult = parseRelativeDate(input);
  if (relativeResult) return relativeResult;
  
  // Common absolute patterns
  const absolutePatterns = [
    // "next Friday", "last Monday"
    /^(next|last|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/,
    // "Friday", "Monday" (interpreted as next occurrence)
    /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/,
    // "tomorrow at 3pm", "today at noon"
    /^(today|tomorrow|yesterday)\s+at\s+(.+)$/,
    // "3pm today", "noon tomorrow"
    /^(.+?)\s+(today|tomorrow|yesterday)$/,
    // "in 2 weeks", "in 3 days"
    /^in\s+(\d+)\s+(minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)$/,
    // "2 weeks from now", "3 days ago"
    /^(\d+)\s+(minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\s+(from now|ago)$/,
    // "December 25", "Dec 25", "25 December"
    /^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(st|nd|rd|th)?$/,
    /^(\d{1,2})(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)$/,
  ];
  
  // Check each pattern
  for (const pattern of absolutePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      return parseMatchedPattern(match, referenceDate, defaultTime);
    }
  }
  
  // Try standard Date parsing as fallback
  const standardDate = new Date(input);
  if (!isNaN(standardDate.getTime())) {
    return standardDate;
  }
  
  return null;
}

/**
 * Parses a relative time phrase into a Date
 * @param input - Relative time phrase
 * @param referenceDate - Reference date (defaults to now)
 * @returns Parsed date or null
 * 
 * @example
 * ```ts
 * parseRelativePhrase('in 2 hours'); // 2 hours from now
 * parseRelativePhrase('5 minutes ago'); // 5 minutes ago
 * parseRelativePhrase('next week'); // 7 days from now
 * ```
 */
export function parseRelativePhrase(input: string, referenceDate: Date = new Date()): Date | null {
  const normalized = input.toLowerCase().trim();
  
  // "in X units"
  const inPattern = /^in\s+(\d+)\s+(millisecond|milliseconds|second|seconds|minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)$/;
  let match = normalized.match(inPattern);
  
  if (match) {
    const amount = parseInt(match[1], 10);
    const unit = normalizeUnit(match[2]);
    return addTime(referenceDate, amount, unit);
  }
  
  // "X units ago"
  const agoPattern = /^(\d+)\s+(millisecond|milliseconds|second|seconds|minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\s+ago$/;
  match = normalized.match(agoPattern);
  
  if (match) {
    const amount = parseInt(match[1], 10);
    const unit = normalizeUnit(match[2]);
    return addTime(referenceDate, -amount, unit);
  }
  
  // "X units from now"
  const fromNowPattern = /^(\d+)\s+(millisecond|milliseconds|second|seconds|minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\s+from\s+now$/;
  match = normalized.match(fromNowPattern);
  
  if (match) {
    const amount = parseInt(match[1], 10);
    const unit = normalizeUnit(match[2]);
    return addTime(referenceDate, amount, unit);
  }
  
  // Common shortcuts
  const shortcuts: Record<string, () => Date> = {
    'now': () => new Date(referenceDate),
    'today': () => {
      const d = new Date(referenceDate);
      d.setHours(0, 0, 0, 0);
      return d;
    },
    'tomorrow': () => addTime(referenceDate, 1, 'day'),
    'yesterday': () => addTime(referenceDate, -1, 'day'),
    'next week': () => addTime(referenceDate, 1, 'week'),
    'last week': () => addTime(referenceDate, -1, 'week'),
    'next month': () => addTime(referenceDate, 1, 'month'),
    'last month': () => addTime(referenceDate, -1, 'month'),
    'next year': () => addTime(referenceDate, 1, 'year'),
    'last year': () => addTime(referenceDate, -1, 'year'),
  };
  
  if (shortcuts[normalized]) {
    return shortcuts[normalized]();
  }
  
  return null;
}

/**
 * Extracts all dates from a text string
 * @param text - Text to extract dates from
 * @param options - Extraction options
 * @returns Array of extracted date information
 * 
 * @example
 * ```ts
 * const text = "Meeting tomorrow at 3pm and dinner next Friday at 7pm";
 * const dates = extractDatesFromText(text);
 * // [
 * //   { date: Date(...), text: 'tomorrow at 3pm', index: 8, ... },
 * //   { date: Date(...), text: 'next Friday at 7pm', index: 37, ... }
 * // ]
 * ```
 */
export function extractDatesFromText(
  text: string,
  options: NaturalParseOptions = {}
): ExtractedDate[] {
  const { referenceDate = new Date() } = options;
  const results: ExtractedDate[] = [];
  
  // Patterns to match
  const patterns = [
    // Relative dates
    /\b(tomorrow|yesterday|today)\b/gi,
    /\b(next|last|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month|year)\b/gi,
    /\bin\s+\d+\s+(minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\b/gi,
    /\b\d+\s+(minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\s+(ago|from now)\b/gi,
    // Absolute dates
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}(st|nd|rd|th)?\b/gi,
    /\b\d{1,2}(st|nd|rd|th)?\s+(of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/gi,
    // Date formats
    /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/g,
    /\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b/g,
    // Time patterns (when found with dates)
    /\bat\s+\d{1,2}(:\d{2})?\s*(am|pm|AM|PM)?\b/gi,
  ];
  
  const processed = new Set<string>();
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const matchedText = match[0];
      const index = match.index;
      
      // Skip if already processed
      if (processed.has(`${index}-${matchedText}`)) continue;
      processed.add(`${index}-${matchedText}`);
      
      // Try to parse the matched text
      const parsed = parseNaturalDate(matchedText, { referenceDate });
      
      if (parsed) {
        results.push({
          date: parsed,
          text: matchedText,
          index,
          type: determineType(matchedText),
          confidence: calculateConfidence(matchedText)
        });
      }
    }
  }
  
  // Sort by index (order in text)
  return results.sort((a, b) => a.index - b.index);
}

/**
 * Suggests possible dates based on context
 * @param context - Context string to analyze
 * @param options - Parsing options
 * @returns Array of suggested dates with confidence scores
 * 
 * @example
 * ```ts
 * suggestDateFromContext('deadline is end of month');
 * // [{ date: Date(last day of current month), confidence: 0.8, ... }]
 * ```
 */
export function suggestDateFromContext(
  context: string,
  options: NaturalParseOptions = {}
): Array<{ date: Date; text: string; confidence: number }> {
  const { referenceDate = new Date() } = options;
  const suggestions: Array<{ date: Date; text: string; confidence: number }> = [];
  const normalized = context.toLowerCase();
  
  // End of month
  if (normalized.includes('end of month') || normalized.includes('eom')) {
    const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
    suggestions.push({ date, text: 'end of month', confidence: 0.85 });
  }
  
  // Beginning of month
  if (normalized.includes('beginning of month') || normalized.includes('start of month')) {
    const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    suggestions.push({ date, text: 'beginning of month', confidence: 0.85 });
  }
  
  // End of year
  if (normalized.includes('end of year') || normalized.includes('eoy')) {
    const date = new Date(referenceDate.getFullYear(), 11, 31);
    suggestions.push({ date, text: 'end of year', confidence: 0.85 });
  }
  
  // Beginning of year
  if (normalized.includes('beginning of year') || normalized.includes('start of year')) {
    const date = new Date(referenceDate.getFullYear(), 0, 1);
    suggestions.push({ date, text: 'beginning of year', confidence: 0.85 });
  }
  
  // End of week
  if (normalized.includes('end of week') || normalized.includes('eow')) {
    const date = new Date(referenceDate);
    const day = date.getDay();
    const diff = 6 - day; // Saturday
    date.setDate(date.getDate() + diff);
    suggestions.push({ date, text: 'end of week', confidence: 0.85 });
  }
  
  // Extract any explicit dates
  const extracted = extractDatesFromText(context, options);
  for (const item of extracted) {
    suggestions.push({
      date: item.date,
      text: item.text,
      confidence: item.confidence
    });
  }
  
  // Sort by confidence
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// Helper functions

function parseMatchedPattern(
  match: RegExpMatchArray,
  referenceDate: Date,
  defaultTime?: { hour: number; minute: number; second?: number }
): Date | null {
  const pattern = match[0];
  
  // Weekday patterns
  if (pattern.includes('monday') || pattern.includes('tuesday') || 
      pattern.includes('wednesday') || pattern.includes('thursday') ||
      pattern.includes('friday') || pattern.includes('saturday') || 
      pattern.includes('sunday')) {
    
    const weekdayMap: Record<string, number> = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6
    };
    
    const weekday = Object.keys(weekdayMap).find(day => pattern.includes(day));
    if (!weekday) return null;
    
    const targetDay = weekdayMap[weekday];
    const currentDay = referenceDate.getDay();
    let daysToAdd = targetDay - currentDay;
    
    if (pattern.includes('next')) {
      if (daysToAdd <= 0) daysToAdd += 7;
    } else if (pattern.includes('last')) {
      if (daysToAdd >= 0) daysToAdd -= 7;
    } else {
      // "this" or just the weekday name - go to next occurrence
      if (daysToAdd <= 0) daysToAdd += 7;
    }
    
    return addTime(referenceDate, daysToAdd, 'day');
  }
  
  // "in X units" pattern
  if (match[1] && match[2]) {
    const amount = parseInt(match[1], 10);
    const unit = normalizeUnit(match[2]);
    
    if (match[3] === 'ago') {
      return addTime(referenceDate, -amount, unit);
    }
    return addTime(referenceDate, amount, unit);
  }
  
  return null;
}

function normalizeUnit(unit: string): 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' {
  const normalized = unit.toLowerCase().replace(/s$/, '');
  
  switch (normalized) {
    case 'millisecond': return 'millisecond';
    case 'second': return 'second';
    case 'minute': return 'minute';
    case 'hour': return 'hour';
    case 'day': return 'day';
    case 'week': return 'week';
    case 'month': return 'month';
    case 'year': return 'year';
    default: return 'day';
  }
}

function determineType(text: string): 'absolute' | 'relative' | 'range' | 'time' {
  const lower = text.toLowerCase();
  
  if (lower.includes('ago') || lower.includes('from now') || lower.includes('in ')) {
    return 'relative';
  }
  
  if (lower.includes('to') || lower.includes(' - ') || lower.includes('between')) {
    return 'range';
  }
  
  if (lower.includes('at ') || lower.includes('am') || lower.includes('pm') || /\d{1,2}:\d{2}/.test(lower)) {
    return 'time';
  }
  
  return 'absolute';
}

function calculateConfidence(text: string): number {
  const lower = text.toLowerCase();
  let confidence = 0.5; // Base confidence
  
  // Higher confidence for specific patterns
  if (lower.includes('tomorrow') || lower.includes('yesterday') || lower.includes('today')) {
    confidence += 0.4;
  }
  
  if (/\d{4}/.test(text)) { // Has year
    confidence += 0.2;
  }
  
  if (/\d{1,2}:\d{2}/.test(text)) { // Has time
    confidence += 0.15;
  }
  
  if (lower.includes('next') || lower.includes('last')) {
    confidence += 0.1;
  }
  
  return Math.min(1.0, confidence);
}
