import { VersionDetail } from '../data/versionMock';

export type DamageLevel = 0 | 1 | 2 | 3 | 4;

export interface RoadDay {
  dateKey: string;
  versions: VersionDetail[];
}

export function getReleaseDate(version: VersionDetail): string {
  return (version.actualTestToTime || '').slice(0, 10);
}

export function getDataAnchorDate(versions: VersionDetail[]): string {
  const dates = versions
    .map((version) => getReleaseDate(version))
    .filter((value) => value && /^\d{4}-\d{2}-\d{2}$/.test(value))
    .sort();
  if (dates.length === 0) {
    const now = new Date();
    return formatDate(now);
  }
  return dates[dates.length - 1];
}

export function assignDamageLevel(totalScore: number): DamageLevel {
  if (totalScore >= 85) return 0;
  if (totalScore >= 75) return 1;
  if (totalScore >= 65) return 2;
  if (totalScore >= 55) return 3;
  return 4;
}

export function damageLabel(level: DamageLevel): string {
  switch (level) {
    case 0:
      return '完好如新';
    case 1:
      return '轻微划痕';
    case 2:
      return '中度受损';
    case 3:
      return '严重受损';
    case 4:
      return '抛锚维修';
    default:
      return '未知状态';
  }
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function shiftDays(dateKey: string, delta: number): string {
  const date = parseDate(dateKey);
  date.setDate(date.getDate() + delta);
  return formatDate(date);
}

export function buildDayWindow(anchor: string, days: number): string[] {
  const safeDays = Math.max(1, Math.floor(days));
  const window: string[] = [];
  for (let index = 0; index < safeDays; index += 1) {
    window.push(shiftDays(anchor, index));
  }
  return window;
}

export function buildRangeWindow(fromKey: string, toKey: string): string[] {
  const [start, end] = [fromKey, toKey].sort();
  const window: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    window.push(cursor);
    cursor = shiftDays(cursor, 1);
    if (window.length > 366) break;
  }
  return window;
}

export function groupByDay(versions: VersionDetail[], window: string[]): RoadDay[] {
  const bucket = new Map<string, VersionDetail[]>();
  window.forEach((dateKey) => bucket.set(dateKey, []));
  versions.forEach((version) => {
    const key = getReleaseDate(version);
    if (bucket.has(key)) {
      bucket.get(key)?.push(version);
    }
  });
  return window.map((dateKey) => ({
    dateKey,
    versions: bucket.get(dateKey) ?? [],
  }));
}

export function weekdayLabel(dateKey: string): string {
  const labels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return labels[parseDate(dateKey).getDay()] ?? '';
}

export function shortDateLabel(dateKey: string): string {
  return dateKey.slice(5);
}
