import { describe, it, expect } from "vitest";
import {
  MILLISECONDS_PER_SECOND,
  MILLISECONDS_PER_MINUTE,
  MILLISECONDS_PER_HOUR,
  MILLISECONDS_PER_DAY,
  MILLISECONDS_PER_WEEK,
  MILLISECONDS_PER_MONTH,
  MILLISECONDS_PER_YEAR,
  SECONDS_PER_MINUTE,
  SECONDS_PER_HOUR,
  SECONDS_PER_DAY,
  SECONDS_PER_WEEK
} from "../src/constants";

describe("Constants", () => {
  it("exports correct time constants", () => {
    expect(MILLISECONDS_PER_SECOND).toBe(1000);
    expect(MILLISECONDS_PER_MINUTE).toBe(60000);
    expect(MILLISECONDS_PER_HOUR).toBe(3600000);
    expect(MILLISECONDS_PER_DAY).toBe(86400000);
    expect(MILLISECONDS_PER_WEEK).toBe(604800000);
    expect(MILLISECONDS_PER_MONTH).toBe(2592000000);
    expect(MILLISECONDS_PER_YEAR).toBe(31536000000);
    expect(SECONDS_PER_MINUTE).toBe(60);
    expect(SECONDS_PER_HOUR).toBe(3600);
    expect(SECONDS_PER_DAY).toBe(86400);
    expect(SECONDS_PER_WEEK).toBe(604800);
  });
});
