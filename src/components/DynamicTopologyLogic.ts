export type ScannerRisk = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseVersionTime(value: string) {
  const time = Date.parse(value.replace(' ', 'T'));
  return Number.isFinite(time) ? time : null;
}

function progressCapByStatus(status: string) {
  if (status.includes('准入')) return 0.28;
  if (status.includes('阻塞')) return 0.46;
  if (status.includes('回归')) return 0.78;
  if (status.includes('待发布')) return 0.92;
  return 0.62;
}

function progressFallbackByStatus(status: string) {
  if (status.includes('准入')) return 0.18;
  if (status.includes('阻塞')) return 0.42;
  if (status.includes('回归')) return 0.76;
  if (status.includes('待发布')) return 0.9;
  return 0.58;
}

export function getTopologyColumnBody(riskLevel: string) {
  if (riskLevel === 'HIGH') return { width: 15, depth: 8 };
  if (riskLevel === 'MEDIUM') return { width: 13, depth: 7 };
  return { width: 11, depth: 6 };
}

export function getTopologyColumnHeight(progress: number) {
  return Math.round(42 + clamp(progress, 0, 1) * 78);
}

export type TopologyColumnForm = 'tile' | 'cabinet' | 'block' | 'tower' | 'alertTower';

export function getTopologyColumnVisualState({
  progress,
  riskLevel,
  totalScore,
  isLit,
}: {
  progress: number;
  riskLevel: string;
  totalScore: number;
  isLit: boolean;
}) {
  const isPriority = riskLevel === 'HIGH' || totalScore < 68;

  if (!isLit) {
    return {
      form: (isPriority ? 'cabinet' : 'tile') as TopologyColumnForm,
      height: isPriority ? 12 : 7,
      hasAlertCap: false,
      isRaised: false,
      windowRows: 0,
    };
  }

  const height = getTopologyColumnHeight(progress);
  const form: TopologyColumnForm = isPriority
    ? 'alertTower'
    : progress < 0.34
      ? 'cabinet'
      : progress < 0.72
        ? 'block'
        : 'tower';

  return {
    form,
    height,
    hasAlertCap: form === 'alertTower',
    isRaised: true,
    windowRows: Math.max(1, Math.min(7, Math.floor(height / 24))),
  };
}

export function getTopologyColumnProgress({
  actualTestFromTime,
  actualTestToTime,
  snapshotsTs,
  status,
}: {
  actualTestFromTime: string;
  actualTestToTime: string;
  snapshotsTs: string;
  status: string;
}) {
  const start = parseVersionTime(actualTestFromTime);
  const end = parseVersionTime(actualTestToTime);
  const snapshot = parseVersionTime(snapshotsTs);

  if (start !== null && end !== null && snapshot !== null && end > start) {
    return Math.min(clamp((snapshot - start) / (end - start), 0.08, 1), progressCapByStatus(status));
  }

  return progressFallbackByStatus(status);
}

function hashKey(key: string) {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getTopologyWindowPattern(key: string, count: number) {
  let seed = hashKey(key);
  return Array.from({ length: count }, (_, index) => {
    seed = Math.imul(seed ^ (index + 1), 1103515245) + 12345;
    return ((seed >>> 16) & 3) !== 0;
  });
}

export function getTopologyColumnScanState({
  screenX,
  scanMinX,
  scanMaxX,
  scannerRisk,
  riskLevel,
}: {
  screenX: number;
  scanMinX: number;
  scanMaxX: number;
  scannerRisk: ScannerRisk;
  riskLevel: string;
}) {
  const inScanBeam = screenX >= scanMinX && screenX <= scanMaxX;
  const matchesScanner = scannerRisk === 'ALL' || riskLevel === scannerRisk;
  const isLit = inScanBeam && matchesScanner;

  return {
    inScanBeam,
    matchesScanner,
    isLit,
    shouldPulse: isLit,
  };
}
