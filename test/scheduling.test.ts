import { describe, it, expect } from 'vitest';
import {
  generateSlots,
  generateSlotsForRange,
  getAvailableSlots,
  findNextAvailable,
  isSlotAvailable,
  findConflicts,
  hasConflict,
  addBuffer,
  removeBuffer,
  expandRecurringAvailability,
  mergeBookings,
  splitSlot,
  DEFAULT_SCHEDULING_CONFIG,
  type Slot,
  type Booking,
  type SchedulingConfig
} from '../src/scheduling.js';

describe('scheduling', () => {
  describe('generateSlots', () => {
    it('should generate slots for a working day', () => {
      // Monday Jan 15, 2024
      const slots = generateSlots(new Date('2024-01-15'), { slotDuration: 60 });

      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0].start).toBeInstanceOf(Date);
      expect(slots[0].end).toBeInstanceOf(Date);
    });

    it('should generate 30-minute slots by default', () => {
      const slots = generateSlots(new Date('2024-01-15'));

      if (slots.length >= 2) {
        const duration = slots[0].end.getTime() - slots[0].start.getTime();
        expect(duration).toBe(30 * 60 * 1000);
      }
    });

    it('should return empty array for weekend', () => {
      // Saturday Jan 13, 2024
      const slots = generateSlots(new Date('2024-01-13'));
      expect(slots).toEqual([]);
    });

    it('should return empty array for holidays', () => {
      const holiday = new Date('2024-01-15');
      const slots = generateSlots(new Date('2024-01-15'), {
        holidays: [holiday]
      });
      expect(slots).toEqual([]);
    });

    it('should mark break time slots as unavailable', () => {
      const slots = generateSlots(new Date('2024-01-15'), {
        slotDuration: 60,
        workingHours: {
          workingDays: [1, 2, 3, 4, 5],
          hours: { start: 9, end: 17 },
          breaks: [{ start: 12, end: 13 }]
        }
      });

      // Find the 12:00-13:00 slot
      const lunchSlot = slots.find(s => s.start.getHours() === 12);
      if (lunchSlot) {
        expect(lunchSlot.available).toBe(false);
      }
    });
  });

  describe('generateSlotsForRange', () => {
    it('should generate slots for multiple days', () => {
      const range = {
        start: new Date('2024-01-15'),
        end: new Date('2024-01-17')
      };
      const slots = generateSlotsForRange(range, { slotDuration: 60 });

      expect(slots.length).toBeGreaterThan(0);
    });

    it('should skip weekends in range', () => {
      // Fri to Mon
      const range = {
        start: new Date('2024-01-12'),
        end: new Date('2024-01-15')
      };
      const slots = generateSlotsForRange(range, { slotDuration: 60 });

      // Should have slots for Fri and Mon only
      const uniqueDays = new Set(slots.map(s => s.start.toDateString()));
      expect(uniqueDays.size).toBe(2);
    });
  });

  describe('getAvailableSlots', () => {
    it('should mark conflicting slots as unavailable', () => {
      const bookings: Booking[] = [
        { start: new Date('2024-01-15T10:00'), end: new Date('2024-01-15T11:00') }
      ];

      const slots = getAvailableSlots(new Date('2024-01-15'), bookings, { slotDuration: 60 });

      const slot10am = slots.find(s => s.start.getHours() === 10);
      if (slot10am) {
        expect(slot10am.available).toBe(false);
      }
    });

    it('should consider buffer time', () => {
      const bookings: Booking[] = [
        { start: new Date('2024-01-15T10:00'), end: new Date('2024-01-15T11:00') }
      ];

      const slots = getAvailableSlots(new Date('2024-01-15'), bookings, {
        slotDuration: 60,
        bufferMinutes: 30
      });

      // 9:00 slot should be unavailable due to 30min buffer before 10:00 booking
      const slot9am = slots.find(s => s.start.getHours() === 9);
      if (slot9am) {
        expect(slot9am.available).toBe(false);
      }
    });
  });

  describe('findNextAvailable', () => {
    it('should find next available slot', () => {
      const bookings: Booking[] = [];
      const slot = findNextAvailable(new Date('2024-01-15T09:00'), bookings, 60);

      expect(slot).not.toBeNull();
      expect(slot?.available).toBe(true);
    });

    it('should skip booked slots', () => {
      const bookings: Booking[] = [
        { start: new Date('2024-01-15T09:00'), end: new Date('2024-01-15T12:00') }
      ];

      const slot = findNextAvailable(new Date('2024-01-15T09:00'), bookings, 60);

      expect(slot).not.toBeNull();
      if (slot) {
        expect(slot.start.getHours()).toBeGreaterThanOrEqual(12);
      }
    });

    it('should return null if no slots available', () => {
      // Book entire day for 30 days
      const bookings: Booking[] = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date('2024-01-15');
        date.setDate(date.getDate() + i);
        bookings.push({
          start: new Date(date.setHours(0, 0, 0, 0)),
          end: new Date(date.setHours(23, 59, 59, 999))
        });
      }

      const slot = findNextAvailable(new Date('2024-01-15'), bookings, 60);
      expect(slot).toBeNull();
    });
  });

  describe('isSlotAvailable', () => {
    it('should return true for non-conflicting slot', () => {
      const slot = { start: new Date('2024-01-15T14:00'), end: new Date('2024-01-15T15:00') };
      const bookings: Booking[] = [
        { start: new Date('2024-01-15T10:00'), end: new Date('2024-01-15T11:00') }
      ];

      expect(isSlotAvailable(slot, bookings)).toBe(true);
    });

    it('should return false for conflicting slot', () => {
      const slot = { start: new Date('2024-01-15T10:30'), end: new Date('2024-01-15T11:30') };
      const bookings: Booking[] = [
        { start: new Date('2024-01-15T10:00'), end: new Date('2024-01-15T11:00') }
      ];

      expect(isSlotAvailable(slot, bookings)).toBe(false);
    });
  });

  describe('findConflicts', () => {
    it('should find all conflicting bookings', () => {
      const bookings: Booking[] = [
        { id: '1', start: new Date('2024-01-15T09:00'), end: new Date('2024-01-15T10:00') },
        { id: '2', start: new Date('2024-01-15T10:00'), end: new Date('2024-01-15T11:00') },
        { id: '3', start: new Date('2024-01-15T14:00'), end: new Date('2024-01-15T15:00') }
      ];

      const proposed = { start: new Date('2024-01-15T09:30'), end: new Date('2024-01-15T10:30') };
      const conflicts = findConflicts(bookings, proposed);

      expect(conflicts).toHaveLength(2);
      expect(conflicts.map(c => c.id)).toContain('1');
      expect(conflicts.map(c => c.id)).toContain('2');
    });

    it('should return empty array when no conflicts', () => {
      const bookings: Booking[] = [
        { start: new Date('2024-01-15T09:00'), end: new Date('2024-01-15T10:00') }
      ];

      const proposed = { start: new Date('2024-01-15T14:00'), end: new Date('2024-01-15T15:00') };
      const conflicts = findConflicts(bookings, proposed);

      expect(conflicts).toHaveLength(0);
    });
  });

  describe('hasConflict', () => {
    it('should return true when conflict exists', () => {
      const bookings: Booking[] = [
        { start: new Date('2024-01-15T10:00'), end: new Date('2024-01-15T11:00') }
      ];
      const proposed = { start: new Date('2024-01-15T10:30'), end: new Date('2024-01-15T11:30') };

      expect(hasConflict(bookings, proposed)).toBe(true);
    });

    it('should return false when no conflict', () => {
      const bookings: Booking[] = [
        { start: new Date('2024-01-15T10:00'), end: new Date('2024-01-15T11:00') }
      ];
      const proposed = { start: new Date('2024-01-15T14:00'), end: new Date('2024-01-15T15:00') };

      expect(hasConflict(bookings, proposed)).toBe(false);
    });
  });

  describe('addBuffer', () => {
    it('should add buffer time to both ends', () => {
      const slot = { start: new Date('2024-01-15T10:00'), end: new Date('2024-01-15T11:00') };
      const buffered = addBuffer(slot, 15);

      expect(buffered.start.getHours()).toBe(9);
      expect(buffered.start.getMinutes()).toBe(45);
      expect(buffered.end.getHours()).toBe(11);
      expect(buffered.end.getMinutes()).toBe(15);
    });
  });

  describe('removeBuffer', () => {
    it('should remove buffer time from both ends', () => {
      const slot = { start: new Date('2024-01-15T09:45'), end: new Date('2024-01-15T11:15') };
      const original = removeBuffer(slot, 15);

      expect(original.start.getHours()).toBe(10);
      expect(original.start.getMinutes()).toBe(0);
      expect(original.end.getHours()).toBe(11);
      expect(original.end.getMinutes()).toBe(0);
    });
  });

  describe('expandRecurringAvailability', () => {
    it('should expand weekly pattern into slots', () => {
      const pattern = {
        frequency: 'weekly' as const,
        startDate: new Date('2024-01-15'),
        byWeekday: [1], // Monday only
        count: 4
      };

      const range = {
        start: new Date('2024-01-01'),
        end: new Date('2024-02-28')
      };

      const slots = expandRecurringAvailability(pattern, range, { slotDuration: 60 });

      expect(slots.length).toBeGreaterThan(0);
    });
  });

  describe('mergeBookings', () => {
    it('should merge adjacent bookings', () => {
      const bookings: Booking[] = [
        { start: new Date('2024-01-15T09:00'), end: new Date('2024-01-15T10:00') },
        { start: new Date('2024-01-15T10:00'), end: new Date('2024-01-15T11:00') }
      ];

      const merged = mergeBookings(bookings);

      expect(merged).toHaveLength(1);
      expect(merged[0].start.getHours()).toBe(9);
      expect(merged[0].end.getHours()).toBe(11);
    });

    it('should merge overlapping bookings', () => {
      const bookings: Booking[] = [
        { start: new Date('2024-01-15T09:00'), end: new Date('2024-01-15T10:30') },
        { start: new Date('2024-01-15T10:00'), end: new Date('2024-01-15T11:00') }
      ];

      const merged = mergeBookings(bookings);

      expect(merged).toHaveLength(1);
      expect(merged[0].start.getHours()).toBe(9);
      expect(merged[0].end.getHours()).toBe(11);
    });

    it('should not merge non-overlapping bookings', () => {
      const bookings: Booking[] = [
        { start: new Date('2024-01-15T09:00'), end: new Date('2024-01-15T10:00') },
        { start: new Date('2024-01-15T14:00'), end: new Date('2024-01-15T15:00') }
      ];

      const merged = mergeBookings(bookings);

      expect(merged).toHaveLength(2);
    });

    it('should handle empty array', () => {
      const merged = mergeBookings([]);
      expect(merged).toEqual([]);
    });
  });

  describe('splitSlot', () => {
    it('should split slot at specified time', () => {
      const slot: Slot = {
        start: new Date('2024-01-15T09:00'),
        end: new Date('2024-01-15T11:00'),
        available: true
      };

      const result = splitSlot(slot, new Date('2024-01-15T10:00'));

      expect(result).not.toBeNull();
      if (result) {
        const [before, after] = result;
        expect(before.start.getHours()).toBe(9);
        expect(before.end.getHours()).toBe(10);
        expect(after.start.getHours()).toBe(10);
        expect(after.end.getHours()).toBe(11);
        expect(before.available).toBe(true);
        expect(after.available).toBe(true);
      }
    });

    it('should return null if split point is at start', () => {
      const slot: Slot = {
        start: new Date('2024-01-15T09:00'),
        end: new Date('2024-01-15T11:00'),
        available: true
      };

      const result = splitSlot(slot, new Date('2024-01-15T09:00'));
      expect(result).toBeNull();
    });

    it('should return null if split point is at end', () => {
      const slot: Slot = {
        start: new Date('2024-01-15T09:00'),
        end: new Date('2024-01-15T11:00'),
        available: true
      };

      const result = splitSlot(slot, new Date('2024-01-15T11:00'));
      expect(result).toBeNull();
    });

    it('should return null if split point is outside slot', () => {
      const slot: Slot = {
        start: new Date('2024-01-15T09:00'),
        end: new Date('2024-01-15T11:00'),
        available: true
      };

      const result = splitSlot(slot, new Date('2024-01-15T14:00'));
      expect(result).toBeNull();
    });
  });
});
