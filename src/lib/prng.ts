/**
 * Mulberry32 is a 32-bit stateful deterministic PRNG.
 * Very fast, uniform distribution, deterministic across all platforms and JS runtimes.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hash string to 32-bit positive integer seed.
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Returns the current date in YYYY-MM-DD format using UTC+7 (Vietnam Time)
 */
export function getTodaySeedString(offsetHours = 7): string {
  const now = new Date();
  // Adjust date with timezone offset
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const targetTime = new Date(utc + 3600000 * offsetHours);

  const year = targetTime.getFullYear();
  const month = String(targetTime.getMonth() + 1).padStart(2, '0');
  const day = String(targetTime.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Calculates remaining milliseconds until next 00:00 in specified timezone
 */
export function getRemainingTimeUntilReset(offsetHours = 7): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const localTarget = new Date(utc + 3600000 * offsetHours);

  // Next midnight
  const nextMidnight = new Date(localTarget);
  nextMidnight.setHours(24, 0, 0, 0);

  const diffMs = Math.max(0, nextMidnight.getTime() - localTarget.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, totalSeconds };
}

/**
 * Fisher-Yates shuffle using seeded PRNG
 */
export function seededShuffle<T>(array: T[], prng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}
