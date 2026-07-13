/* ═══════════════════════════════════════════════════════════════════════
   Unit Tests — lib/utils.ts
   Tests for cn(), formatDate(), formatCurrency(), formatNumber(), truncate()
   ═══════════════════════════════════════════════════════════════════════ */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cn, formatDate, formatCurrency, formatNumber, truncate } from '../../lib/utils';

describe('cn (class name merge)', () => {
  it('merges simple class strings', () => {
    expect(cn('text-red-500', 'bg-white')).toBe('text-red-500 bg-white');
  });

  it('handles conditional classes (falsy values are excluded)', () => {
    expect(cn('base', false && 'hidden', undefined, null, 'active')).toBe('base active');
  });

  it('merges conflicting Tailwind classes (last wins)', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('handles empty call', () => {
    expect(cn()).toBe('');
  });

  it('handles array input', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });
});

describe('formatDate', () => {
  let now: number;

  beforeEach(() => {
    now = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Just now" for dates < 1 minute ago', () => {
    const date = new Date(now - 30 * 1000); // 30 seconds ago
    expect(formatDate(date)).toBe('Just now');
  });

  it('returns "Xm ago" for dates < 1 hour ago', () => {
    const date = new Date(now - 15 * 60 * 1000); // 15 min ago
    expect(formatDate(date)).toBe('15m ago');
  });

  it('returns "Xh ago" for dates < 1 day ago', () => {
    const date = new Date(now - 5 * 60 * 60 * 1000); // 5 hours ago
    expect(formatDate(date)).toBe('5h ago');
  });

  it('returns "Xd ago" for dates <= 7 days ago', () => {
    const date = new Date(now - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    expect(formatDate(date)).toBe('3d ago');
  });

  it('returns locale date string for dates > 7 days ago', () => {
    const date = new Date(now - 14 * 24 * 60 * 60 * 1000); // 14 days ago
    const result = formatDate(date);
    // Should be a locale date string, not a relative one
    expect(result).not.toContain('ago');
    expect(result).not.toBe('Just now');
  });

  it('handles string date input', () => {
    const date = new Date(now - 2 * 60 * 60 * 1000).toISOString();
    expect(formatDate(date)).toBe('2h ago');
  });

  it('returns formatted date for future dates (not "Just now")', () => {
    const futureDate = new Date(now + 365 * 24 * 60 * 60 * 1000); // 1 year in future
    const result = formatDate(futureDate);
    expect(result).not.toBe('Just now');
    expect(result).not.toContain('ago');
    // Should be a locale-formatted date string
    expect(result.length).toBeGreaterThan(3);
  });

  it('handles dates exactly at current time', () => {
    const date = new Date(now);
    expect(formatDate(date)).toBe('Just now');
  });
});

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    const result = formatCurrency(1234.56);
    expect(result).toBe('$1,234.56');
  });

  it('formats GBP when specified', () => {
    const result = formatCurrency(5000, 'GBP');
    expect(result).toContain('5,000');
    expect(result).toMatch(/£|GBP/);
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles negative values', () => {
    const result = formatCurrency(-500);
    expect(result).toContain('500');
  });
});

describe('formatNumber', () => {
  it('formats large numbers with commas', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('handles small numbers', () => {
    expect(formatNumber(42)).toBe('42');
  });
});

describe('truncate', () => {
  it('returns full string when shorter than limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and adds ellipsis when exceeding limit', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
  });

  it('returns exact-length string as-is', () => {
    expect(truncate('12345', 5)).toBe('12345');
  });

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('');
  });
});
