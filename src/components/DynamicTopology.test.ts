import { describe, expect, it } from 'vitest';
import source from './DynamicTopology.tsx?raw';
import {
  getTopologyColumnBody,
  getTopologyColumnHeight,
  getTopologyColumnProgress,
  getTopologyColumnScanState,
  getTopologyColumnVisualState,
  getTopologyWindowPattern,
} from './DynamicTopologyLogic';

describe('DynamicTopology scanner speed continuity', () => {
  it('keeps scanner speed out of the render effect dependencies', () => {
    expect(source).not.toContain('}, [nav, scannerRisk, scannerSpeed]);');
    expect(source).toContain('}, [detailState, nav, scannerRisk]);');
  });
});

describe('DynamicTopology visual topology rendering', () => {
  it('uses the visual state to keep default terrain low and only raise scanned nodes', () => {
    expect(source).toContain('const visualState = getTopologyColumnVisualState');
    expect(source).toContain('if (!visualState.isRaised)');
    expect(source).toContain('visualState.hasAlertCap');
  });

  it('lights unknown-risk columns when scanner risk is unknown', () => {
    expect(getTopologyColumnScanState({
      screenX: 50,
      scanMinX: 0,
      scanMaxX: 100,
      scannerRisk: 'UNKNOWN',
      riskLevel: 'UNKNOWN',
    }).isLit).toBe(true);
  });
});

describe('getTopologyColumnBody', () => {
  it('uses a substantial block footprint instead of thin point-like light columns', () => {
    expect(getTopologyColumnBody('LOW')).toEqual({ width: 11, depth: 6 });
    expect(getTopologyColumnBody('MEDIUM')).toEqual({ width: 13, depth: 7 });
    expect(getTopologyColumnBody('HIGH')).toEqual({ width: 15, depth: 8 });
  });
});

describe('getTopologyColumnHeight', () => {
  it('maps version progress to the visible tower height range', () => {
    expect(getTopologyColumnHeight(0)).toBe(42);
    expect(getTopologyColumnHeight(0.5)).toBe(81);
    expect(getTopologyColumnHeight(1)).toBe(120);
  });

  it('clamps out-of-range progress values', () => {
    expect(getTopologyColumnHeight(-1)).toBe(42);
    expect(getTopologyColumnHeight(2)).toBe(120);
  });
});

describe('getTopologyColumnVisualState', () => {
  it('keeps unscanned versions as low terrain instead of full towers', () => {
    expect(
      getTopologyColumnVisualState({
        progress: 0.9,
        riskLevel: 'LOW',
        totalScore: 92,
        isLit: false,
      }),
    ).toEqual({
      form: 'tile',
      height: 7,
      hasAlertCap: false,
      isRaised: false,
      windowRows: 0,
    });
  });

  it('raises scanned ordinary versions into low or medium cabinet blocks', () => {
    expect(
      getTopologyColumnVisualState({
        progress: 0.18,
        riskLevel: 'LOW',
        totalScore: 88,
        isLit: true,
      }),
    ).toMatchObject({
      form: 'cabinet',
      isRaised: true,
      hasAlertCap: false,
    });

    expect(
      getTopologyColumnVisualState({
        progress: 0.52,
        riskLevel: 'MEDIUM',
        totalScore: 76,
        isLit: true,
      }),
    ).toMatchObject({
      form: 'block',
      isRaised: true,
      hasAlertCap: false,
    });
  });

  it('raises high risk or priority versions as alert towers with warning caps', () => {
    expect(
      getTopologyColumnVisualState({
        progress: 0.76,
        riskLevel: 'HIGH',
        totalScore: 58,
        isLit: true,
      }),
    ).toMatchObject({
      form: 'alertTower',
      isRaised: true,
      hasAlertCap: true,
    });

    expect(
      getTopologyColumnVisualState({
        progress: 0.9,
        riskLevel: 'LOW',
        totalScore: 61,
        isLit: true,
      }),
    ).toMatchObject({
      form: 'alertTower',
      hasAlertCap: true,
    });
  });
});

describe('getTopologyColumnProgress', () => {
  it('uses snapshot position in the version test window when dates are available', () => {
    expect(
      getTopologyColumnProgress({
        actualTestFromTime: '2026-06-10 10:00:00',
        actualTestToTime: '2026-06-20 10:00:00',
        snapshotsTs: '2026-06-15T10:00:00',
        status: '测试中',
      }),
    ).toBeCloseTo(0.5);
  });

  it('keeps early status phases visibly shorter even when mock timestamps are near the end', () => {
    expect(
      getTopologyColumnProgress({
        actualTestFromTime: '2026-06-10 10:00:00',
        actualTestToTime: '2026-06-20 10:00:00',
        snapshotsTs: '2026-06-19T18:00:00',
        status: '准入中',
      }),
    ).toBe(0.28);
  });

  it('falls back to status when date progress is not usable', () => {
    expect(
      getTopologyColumnProgress({
        actualTestFromTime: '',
        actualTestToTime: '',
        snapshotsTs: '',
        status: '准入中',
      }),
    ).toBe(0.18);

    expect(
      getTopologyColumnProgress({
        actualTestFromTime: '',
        actualTestToTime: '',
        snapshotsTs: '',
        status: '待回归',
      }),
    ).toBe(0.76);
  });
});

describe('getTopologyWindowPattern', () => {
  it('returns deterministic sparse windows for the same version key', () => {
    expect(getTopologyWindowPattern('TED-64460', 5)).toEqual(getTopologyWindowPattern('TED-64460', 5));
    expect(getTopologyWindowPattern('TED-64460', 5)).toHaveLength(5);
    expect(getTopologyWindowPattern('TED-64460', 5).some(Boolean)).toBe(true);
    expect(getTopologyWindowPattern('TED-64460', 5).some((value) => !value)).toBe(true);
  });
});

describe('getTopologyColumnScanState', () => {
  it('keeps unscanned columns gray and static while scanned matching columns light up and pulse', () => {
    expect(
      getTopologyColumnScanState({
        screenX: 120,
        scanMinX: 240,
        scanMaxX: 420,
        scannerRisk: 'ALL',
        riskLevel: 'HIGH',
      }),
    ).toEqual({
      inScanBeam: false,
      matchesScanner: true,
      isLit: false,
      shouldPulse: false,
    });

    expect(
      getTopologyColumnScanState({
        screenX: 300,
        scanMinX: 240,
        scanMaxX: 420,
        scannerRisk: 'ALL',
        riskLevel: 'HIGH',
      }),
    ).toEqual({
      inScanBeam: true,
      matchesScanner: true,
      isLit: true,
      shouldPulse: true,
    });
  });

  it('keeps scanned non-matching risk columns subdued when a scanner filter is active', () => {
    expect(
      getTopologyColumnScanState({
        screenX: 300,
        scanMinX: 240,
        scanMaxX: 420,
        scannerRisk: 'HIGH',
        riskLevel: 'LOW',
      }),
    ).toEqual({
      inScanBeam: true,
      matchesScanner: false,
      isLit: false,
      shouldPulse: false,
    });
  });

  it('turns previously scanned columns gray again after the beam moves away', () => {
    expect(
      getTopologyColumnScanState({
        screenX: 120,
        scanMinX: 240,
        scanMaxX: 420,
        scannerRisk: 'ALL',
        riskLevel: 'MEDIUM',
      }),
    ).toEqual({
      inScanBeam: false,
      matchesScanner: true,
      isLit: false,
      shouldPulse: false,
    });
  });
});
