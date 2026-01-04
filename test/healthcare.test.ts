import { describe, it, expect } from 'vitest';
import {
  getMedicationTimes,
  getNextMedicationTime,
  parseMedicationFrequency,
  generateShiftSchedule,
  getShiftForTime,
  isOnShift,
  createOnCallRotation,
  getOnCallStaff,
  isWithinComplianceWindow,
  getComplianceDeadline,
  timeUntilDeadline,
  calculateRestBetweenShifts,
  MEDICATION_FREQUENCIES,
  SHIFT_DURATIONS,
  DEFAULT_MEDICATION_CONFIG
} from '../src/healthcare.js';

// Helper to create local dates without timezone confusion
function localDate(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

describe('healthcare', () => {
  describe('MEDICATION_FREQUENCIES', () => {
    it('should have correct dose counts', () => {
      expect(MEDICATION_FREQUENCIES.QD).toBe(1);
      expect(MEDICATION_FREQUENCIES.BID).toBe(2);
      expect(MEDICATION_FREQUENCIES.TID).toBe(3);
      expect(MEDICATION_FREQUENCIES.QID).toBe(4);
      expect(MEDICATION_FREQUENCIES.q4h).toBe(6);
      expect(MEDICATION_FREQUENCIES.q6h).toBe(4);
      expect(MEDICATION_FREQUENCIES.q8h).toBe(3);
      expect(MEDICATION_FREQUENCIES.q12h).toBe(2);
      expect(MEDICATION_FREQUENCIES.PRN).toBe(null);
    });
  });

  describe('SHIFT_DURATIONS', () => {
    it('should have correct hours', () => {
      expect(SHIFT_DURATIONS['8hr']).toBe(8);
      expect(SHIFT_DURATIONS['12hr']).toBe(12);
      expect(SHIFT_DURATIONS['24hr']).toBe(24);
    });
  });

  describe('DEFAULT_MEDICATION_CONFIG', () => {
    it('should have sensible defaults', () => {
      expect(DEFAULT_MEDICATION_CONFIG.wakeTime).toBe('07:00');
      expect(DEFAULT_MEDICATION_CONFIG.sleepTime).toBe('22:00');
      expect(DEFAULT_MEDICATION_CONFIG.withMeals).toBe(false);
    });
  });

  describe('getMedicationTimes', () => {
    it('should return one time for QD', () => {
      const times = getMedicationTimes(localDate(2024, 1, 15), 'QD');
      expect(times.length).toBe(1);
      expect(times[0].getHours()).toBe(7);
      expect(times[0].getMinutes()).toBe(0);
    });

    it('should return two times for BID', () => {
      const times = getMedicationTimes(localDate(2024, 1, 15), 'BID');
      expect(times.length).toBe(2);
      expect(times[0].getHours()).toBe(7); // Morning
      expect(times[1].getHours()).toBe(14); // Afternoon (7 + 7.5 hours)
    });

    it('should return three times for TID', () => {
      const times = getMedicationTimes(localDate(2024, 1, 15), 'TID');
      expect(times.length).toBe(3);
    });

    it('should return four times for QID', () => {
      const times = getMedicationTimes(localDate(2024, 1, 15), 'QID');
      expect(times.length).toBe(4);
    });

    it('should return six times for q4h', () => {
      const times = getMedicationTimes(localDate(2024, 1, 15), 'q4h');
      expect(times.length).toBe(6);
    });

    it('should return empty array for PRN', () => {
      const times = getMedicationTimes(localDate(2024, 1, 15), 'PRN');
      expect(times).toEqual([]);
    });

    it('should respect custom wake/sleep times', () => {
      const times = getMedicationTimes(localDate(2024, 1, 15), 'QD', {
        wakeTime: '06:00',
        sleepTime: '21:00'
      });
      expect(times[0].getHours()).toBe(6);
    });

    it('should distribute times evenly across waking hours', () => {
      const times = getMedicationTimes(localDate(2024, 1, 15), 'q12h');
      expect(times.length).toBe(2);
      // First dose at wake time (7:00)
      expect(times[0].getHours()).toBe(7);
      // Second dose 7.5 hours later (within 15 waking hours / 2 = 7.5h intervals)
    });
  });

  describe('getNextMedicationTime', () => {
    it('should return next dose same day if before last dose', () => {
      const next = getNextMedicationTime(localDate(2024, 1, 15, 8, 0), 'BID');
      expect(next).not.toBeNull();
      expect(next!.getDate()).toBe(15);
      expect(next!.getHours()).toBe(14); // Second BID dose
    });

    it('should return first dose tomorrow if after last dose today', () => {
      const next = getNextMedicationTime(localDate(2024, 1, 15, 20, 0), 'BID');
      expect(next).not.toBeNull();
      expect(next!.getDate()).toBe(16);
      expect(next!.getHours()).toBe(7); // First dose tomorrow
    });

    it('should return null for PRN', () => {
      const next = getNextMedicationTime(localDate(2024, 1, 15, 10, 0), 'PRN');
      expect(next).toBeNull();
    });

    it('should return next dose after current time', () => {
      const next = getNextMedicationTime(localDate(2024, 1, 15, 7, 30), 'QD');
      // QD is only at 7:00, so next is tomorrow
      expect(next!.getDate()).toBe(16);
    });
  });

  describe('parseMedicationFrequency', () => {
    it('should parse uppercase abbreviations', () => {
      expect(parseMedicationFrequency('QD')).toBe('QD');
      expect(parseMedicationFrequency('BID')).toBe('BID');
      expect(parseMedicationFrequency('TID')).toBe('TID');
      expect(parseMedicationFrequency('QID')).toBe('QID');
    });

    it('should parse lowercase abbreviations', () => {
      expect(parseMedicationFrequency('qd')).toBe('QD');
      expect(parseMedicationFrequency('bid')).toBe('BID');
      expect(parseMedicationFrequency('q4h')).toBe('q4h');
    });

    it('should parse natural language', () => {
      expect(parseMedicationFrequency('once daily')).toBe('QD');
      expect(parseMedicationFrequency('twice daily')).toBe('BID');
      expect(parseMedicationFrequency('every 6 hours')).toBe('q6h');
      expect(parseMedicationFrequency('as needed')).toBe('PRN');
    });

    it('should return null for invalid frequency', () => {
      expect(parseMedicationFrequency('invalid')).toBeNull();
      expect(parseMedicationFrequency('xyz')).toBeNull();
    });

    it('should parse OD as QD', () => {
      expect(parseMedicationFrequency('od')).toBe('QD');
    });
  });

  describe('generateShiftSchedule', () => {
    it('should generate 8-hour shifts', () => {
      const shifts = generateShiftSchedule(
        localDate(2024, 1, 15, 7, 0),
        localDate(2024, 1, 15, 23, 0),
        { pattern: '8hr', startTime: { hour: 7, minute: 0 } }
      );
      expect(shifts.length).toBe(2); // 7-15, 15-23
    });

    it('should generate 12-hour shifts', () => {
      const shifts = generateShiftSchedule(
        localDate(2024, 1, 15, 7, 0),
        localDate(2024, 1, 15, 19, 0),
        { pattern: '12hr', startTime: { hour: 7, minute: 0 } }
      );
      expect(shifts.length).toBe(1); // 7-19
    });

    it('should generate 24-hour shifts', () => {
      const shifts = generateShiftSchedule(
        localDate(2024, 1, 15, 7, 0),
        localDate(2024, 1, 17, 7, 0),
        { pattern: '24hr', startTime: { hour: 7, minute: 0 } }
      );
      expect(shifts.length).toBe(2); // 2 days = 2 shifts
    });

    it('should respect start time', () => {
      const shifts = generateShiftSchedule(
        localDate(2024, 1, 15, 7, 0),
        localDate(2024, 1, 15, 19, 0),
        { pattern: '12hr', startTime: { hour: 7, minute: 0 } }
      );
      expect(shifts[0].start.getHours()).toBe(7);
    });

    it('should handle multi-day ranges', () => {
      const shifts = generateShiftSchedule(
        localDate(2024, 1, 15, 7, 0),
        localDate(2024, 1, 18, 7, 0),
        { pattern: '12hr', startTime: { hour: 7, minute: 0 } }
      );
      expect(shifts.length).toBe(6); // 3 days * 2 shifts
    });
  });

  describe('getShiftForTime', () => {
    it('should return correct 8-hour shift', () => {
      const shift = getShiftForTime(
        localDate(2024, 1, 15, 10, 0),
        { pattern: '8hr', startTime: { hour: 7, minute: 0 } }
      );
      expect(shift.start.getHours()).toBe(7);
      expect(shift.end.getHours()).toBe(15);
    });

    it('should return correct 12-hour shift', () => {
      const shift = getShiftForTime(
        localDate(2024, 1, 15, 20, 0),
        { pattern: '12hr', startTime: { hour: 7, minute: 0 } }
      );
      expect(shift.start.getHours()).toBe(19);
      expect(shift.end.getHours()).toBe(7);
    });

    it('should handle time before first shift of day', () => {
      const shift = getShiftForTime(
        localDate(2024, 1, 15, 5, 0),
        { pattern: '8hr', startTime: { hour: 7, minute: 0 } }
      );
      // Should be in previous day's overnight shift
      expect(shift.end.getHours()).toBe(7);
    });
  });

  describe('isOnShift', () => {
    it('should return true during shift', () => {
      const result = isOnShift(
        localDate(2024, 1, 15, 10, 0),
        localDate(2024, 1, 15, 7, 0),
        { pattern: '8hr', startTime: { hour: 7, minute: 0 } }
      );
      expect(result).toBe(true);
    });

    it('should return false before shift starts', () => {
      const result = isOnShift(
        localDate(2024, 1, 15, 6, 0),
        localDate(2024, 1, 15, 7, 0),
        { pattern: '8hr', startTime: { hour: 7, minute: 0 } }
      );
      expect(result).toBe(false);
    });

    it('should return false after shift ends', () => {
      const result = isOnShift(
        localDate(2024, 1, 15, 16, 0),
        localDate(2024, 1, 15, 7, 0),
        { pattern: '8hr', startTime: { hour: 7, minute: 0 } }
      );
      expect(result).toBe(false);
    });

    it('should handle shift boundary (start inclusive, end exclusive)', () => {
      const result = isOnShift(
        localDate(2024, 1, 15, 15, 0),
        localDate(2024, 1, 15, 7, 0),
        { pattern: '8hr', startTime: { hour: 7, minute: 0 } }
      );
      expect(result).toBe(false); // 15:00 is end time, exclusive
    });
  });

  describe('createOnCallRotation', () => {
    it('should create rotation for multiple staff', () => {
      const rotation = createOnCallRotation(
        localDate(2024, 1, 15),
        localDate(2024, 1, 18),
        ['Dr. Smith', 'Dr. Jones', 'Dr. Brown'],
        24
      );
      expect(rotation.length).toBe(3);
      expect(rotation[0].staff).toBe('Dr. Smith');
      expect(rotation[1].staff).toBe('Dr. Jones');
      expect(rotation[2].staff).toBe('Dr. Brown');
    });

    it('should cycle through staff if more shifts than staff', () => {
      const rotation = createOnCallRotation(
        localDate(2024, 1, 15),
        localDate(2024, 1, 20),
        ['Dr. A', 'Dr. B'],
        24
      );
      expect(rotation.length).toBe(5);
      expect(rotation[0].staff).toBe('Dr. A');
      expect(rotation[1].staff).toBe('Dr. B');
      expect(rotation[2].staff).toBe('Dr. A');
      expect(rotation[3].staff).toBe('Dr. B');
      expect(rotation[4].staff).toBe('Dr. A');
    });

    it('should handle custom hours per shift', () => {
      const rotation = createOnCallRotation(
        localDate(2024, 1, 15),
        localDate(2024, 1, 16),
        ['Dr. A', 'Dr. B'],
        12
      );
      expect(rotation.length).toBe(2);
    });

    it('should return empty array for empty staff list', () => {
      const rotation = createOnCallRotation(
        localDate(2024, 1, 15),
        localDate(2024, 1, 18),
        [],
        24
      );
      expect(rotation).toEqual([]);
    });
  });

  describe('getOnCallStaff', () => {
    it('should return correct staff member', () => {
      const rotation = createOnCallRotation(
        localDate(2024, 1, 15),
        localDate(2024, 1, 18),
        ['Dr. Smith', 'Dr. Jones', 'Dr. Brown'],
        24
      );
      const onCall = getOnCallStaff(localDate(2024, 1, 15, 12, 0), rotation);
      expect(onCall).toBe('Dr. Smith');
    });

    it('should return correct staff at different times', () => {
      const rotation = createOnCallRotation(
        localDate(2024, 1, 15),
        localDate(2024, 1, 18),
        ['Dr. Smith', 'Dr. Jones', 'Dr. Brown'],
        24
      );
      expect(getOnCallStaff(localDate(2024, 1, 16, 12, 0), rotation)).toBe('Dr. Jones');
      expect(getOnCallStaff(localDate(2024, 1, 17, 12, 0), rotation)).toBe('Dr. Brown');
    });

    it('should return null if outside rotation', () => {
      const rotation = createOnCallRotation(
        localDate(2024, 1, 15),
        localDate(2024, 1, 16),
        ['Dr. Smith'],
        24
      );
      const onCall = getOnCallStaff(localDate(2024, 1, 20, 12, 0), rotation);
      expect(onCall).toBeNull();
    });
  });

  describe('isWithinComplianceWindow', () => {
    it('should return true if event before deadline', () => {
      const result = isWithinComplianceWindow(
        localDate(2024, 1, 15, 10, 0),
        localDate(2024, 1, 15, 12, 0)
      );
      expect(result).toBe(true);
    });

    it('should return true if event at deadline', () => {
      const result = isWithinComplianceWindow(
        localDate(2024, 1, 15, 12, 0),
        localDate(2024, 1, 15, 12, 0)
      );
      expect(result).toBe(true);
    });

    it('should return false if event after deadline', () => {
      const result = isWithinComplianceWindow(
        localDate(2024, 1, 15, 13, 0),
        localDate(2024, 1, 15, 12, 0)
      );
      expect(result).toBe(false);
    });
  });

  describe('getComplianceDeadline', () => {
    it('should add hours to event time', () => {
      const deadline = getComplianceDeadline(localDate(2024, 1, 15, 8, 0), 24);
      expect(deadline.getDate()).toBe(16);
      expect(deadline.getHours()).toBe(8);
    });

    it('should handle multi-day windows', () => {
      const deadline = getComplianceDeadline(localDate(2024, 1, 15, 8, 0), 72);
      expect(deadline.getDate()).toBe(18);
      expect(deadline.getHours()).toBe(8);
    });

    it('should handle fractional hours', () => {
      const deadline = getComplianceDeadline(localDate(2024, 1, 15, 8, 0), 1.5);
      expect(deadline.getHours()).toBe(9);
      expect(deadline.getMinutes()).toBe(30);
    });
  });

  describe('timeUntilDeadline', () => {
    it('should return duration until deadline', () => {
      const remaining = timeUntilDeadline(
        localDate(2024, 1, 15, 10, 0),
        localDate(2024, 1, 16, 10, 0)
      );
      expect(remaining).not.toBeNull();
      expect(remaining!.hours).toBe(24);
    });

    it('should return null if past deadline', () => {
      const remaining = timeUntilDeadline(
        localDate(2024, 1, 16, 10, 0),
        localDate(2024, 1, 15, 10, 0)
      );
      expect(remaining).toBeNull();
    });

    it('should return zero duration at deadline', () => {
      const remaining = timeUntilDeadline(
        localDate(2024, 1, 15, 10, 0),
        localDate(2024, 1, 15, 10, 0)
      );
      expect(remaining).not.toBeNull();
      expect(remaining!.milliseconds).toBe(0);
    });
  });

  describe('calculateRestBetweenShifts', () => {
    it('should calculate rest hours correctly', () => {
      const rest = calculateRestBetweenShifts(
        localDate(2024, 1, 15, 19, 0),
        localDate(2024, 1, 16, 7, 0)
      );
      expect(rest).toBe(12);
    });

    it('should handle same-day shifts', () => {
      const rest = calculateRestBetweenShifts(
        localDate(2024, 1, 15, 15, 0),
        localDate(2024, 1, 15, 19, 0)
      );
      expect(rest).toBe(4);
    });

    it('should return negative for overlapping shifts', () => {
      const rest = calculateRestBetweenShifts(
        localDate(2024, 1, 15, 19, 0),
        localDate(2024, 1, 15, 15, 0)
      );
      expect(rest).toBe(-4);
    });

    it('should handle multi-day rest', () => {
      const rest = calculateRestBetweenShifts(
        localDate(2024, 1, 15, 19, 0),
        localDate(2024, 1, 17, 7, 0)
      );
      expect(rest).toBe(36);
    });
  });
});
