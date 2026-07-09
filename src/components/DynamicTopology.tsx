import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { VersionDetail } from '../data/versionMock';
import {
  getTopologyColumnBody,
  getTopologyColumnProgress,
  getTopologyColumnScanState,
  getTopologyColumnVisualState,
  getTopologyWindowPattern,
  type ScannerRisk,
} from './DynamicTopologyLogic';

const COLS = 14;
const ROWS = 8;
const SPACING = 52;
const MAX_NODES = COLS * ROWS;

function riskRGB(risk: string) {
  if (risk === 'HIGH') return { r: 218, g: 82, b: 98 };
  if (risk === 'MEDIUM') return { r: 201, g: 148, b: 64 };
  if (risk === 'LOW') return { r: 58, g: 168, b: 154 };
  return { r: 36, g: 150, b: 142 };
}

function hexGridPoints(cx: number, cy: number, radius: number) {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    points.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
  }
  return points;
}

function drawHex(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const pts = hexGridPoints(cx, cy, r);
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < 6; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
}

interface Column {
  id: string;
  gx: number;
  gy: number;
  progress: number;
  version: VersionDetail;
  color: ReturnType<typeof riskRGB>;
}

interface VisibleColumn {
  col: Column;
  pos: ReturnType<typeof screenPos>;
  topY: number;
  groundY: number;
  width: number;
  depth: number;
}

function buildColumns(versions: VersionDetail[]): Column[] {
  return versions.slice(0, MAX_NODES).map((v, i) => {
    const progress = getTopologyColumnProgress(v);
    return {
      id: `${v.sysId}-${v.patchId}`,
      gx: i % COLS,
      gy: Math.floor(i / COLS),
      progress,
      version: v,
      color: riskRGB(v.riskLevel),
    };
  });
}

function screenPos(gx: number, gy: number, cx: number, cy: number, s: number) {
  const offsetX = gy % 2 === 0 ? 0 : SPACING * 0.5;
  return {
    x: cx + (gx - COLS / 2) * SPACING * s + offsetX * s,
    y: cy + (gy - ROWS / 2 + 1.5) * SPACING * 0.7 * s,
  };
}

function DynamicTopology({
  versions,
  scannerRisk = 'ALL',
  scannerSpeed = 1,
  detailState,
}: {
  versions: VersionDetail[];
  scannerRisk?: ScannerRisk;
  scannerSpeed?: number;
  detailState?: { from: string; fromLabel: string };
}) {
  const nav = useNavigate();
  const cvs = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const colsRef = useRef<Column[]>([]);
  const visibleColsRef = useRef<VisibleColumn[]>([]);
  const hoverRef = useRef<Column | null>(null);
  const scannerSpeedRef = useRef(scannerSpeed);
  const scanTimeRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const [hover, setHover] = useState<Column | null>(null);

  useEffect(() => {
    colsRef.current = buildColumns(versions);
  }, [versions]);

  useEffect(() => {
    scannerSpeedRef.current = scannerSpeed;
  }, [scannerSpeed]);

  useEffect(() => {
    const canvas = cvs.current;
    const w = wrap.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !w || !ctx) return;
    let frame = 0;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);

    const resize = () => {
      const W = w.clientWidth;
      const H = w.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (t: number) => {
      const lastFrameTime = lastFrameTimeRef.current ?? t;
      const frameDelta = Math.min(t - lastFrameTime, 80);
      lastFrameTimeRef.current = t;
      if (!hoverRef.current) scanTimeRef.current += frameDelta * scannerSpeedRef.current;
      const scanTime = scanTimeRef.current;
      const W = w.clientWidth;
      const H = w.clientHeight;
      const cx = W / 2;
      const cy = H * 0.64;
      const s = 1;
      const columns = colsRef.current;
      const theme = document.documentElement.getAttribute('data-theme');
      const dark = theme !== 'light';
      const bgBase = dark ? '#030a14' : '#f0f4f8';
      const bgBright = dark ? '#061220' : '#ffffff';
      const scanner = riskRGB(scannerRisk);
      const scannerColor = `${scanner.r},${scanner.g},${scanner.b}`;

      // drone free orbit around the city
      const dx = W / 2 + Math.cos(scanTime / 800) * W * 0.35 + Math.cos(scanTime / 2100) * W * 0.16;
      const dy = H * 0.18 + Math.sin(scanTime / 1100) * H * 0.18 + Math.cos(scanTime / 1700) * H * 0.06;
      const beamHalf = 180 * s;

      ctx.clearRect(0, 0, W, H);

      // background gradient
      const grad = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, Math.max(W, H) * 0.8);
      grad.addColorStop(0, bgBright);
      grad.addColorStop(0.55, bgBright);
      grad.addColorStop(1, bgBase);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // hexagonal ground grid
      const hexR = 30 * s;
      const hexDy = hexR * 1.72;
      const hexDx = hexR * 1.5;
      ctx.strokeStyle = dark ? 'rgba(80,180,220,0.06)' : 'rgba(15,23,42,0.05)';
      ctx.lineWidth = 0.6;
      for (let row = -4; row < ROWS + 4; row++) {
        const offsetX = row % 2 === 0 ? 0 : hexDx / 2;
        for (let col = -8; col < COLS + 8; col++) {
          const hx = cx - (COLS / 2) * hexDx * s + col * hexDx * s + offsetX * s;
          const hy = cy - (ROWS / 2) * hexDy * s + row * hexDy * s;
          drawHex(ctx, hx, hy, hexR);
          ctx.stroke();
        }
      }

      // volumetric beam from drone
      const beam = ctx.createLinearGradient(dx, dy + 10, dx, H * 0.9);
      beam.addColorStop(0, `rgba(${scannerColor},${dark ? 0.13 : 0.09})`);
      beam.addColorStop(0.4, `rgba(${scannerColor},${dark ? 0.06 : 0.045})`);
      beam.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(dx - 14, dy + 10);
      ctx.lineTo(dx + 14, dy + 10);
      ctx.lineTo(dx + beamHalf, H * 0.9);
      ctx.lineTo(dx - beamHalf, H * 0.9);
      ctx.closePath();
      ctx.fill();

      // beam edge lines
      ctx.strokeStyle = `rgba(${scannerColor},${dark ? 0.2 : 0.15})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(dx - 14, dy + 10); ctx.lineTo(dx - beamHalf, H * 0.9);
      ctx.moveTo(dx + 14, dy + 10); ctx.lineTo(dx + beamHalf, H * 0.9);
      ctx.stroke();

      // particles in beam
      for (let i = 0; i < 60; i++) {
        const progress = ((scanTime / 800 + i * 0.12) % 1);
        const px = dx + (Math.sin(i * 1.7) * beamHalf * 0.8 * progress);
        const py = dy + 10 + (H * 0.9 - dy - 10) * progress;
        const alpha = 0.15 + 0.25 * (1 - Math.abs(progress - 0.5) * 2);
        ctx.fillStyle = `rgba(${scannerColor},${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // scan region for effect application
      const scanMinX = dx - beamHalf;
      const scanMaxX = dx + beamHalf;

      const litCols: VisibleColumn[] = [];

      for (const col of columns) {
        const pos = screenPos(col.gx, col.gy, cx, cy, s);
        const scanState = getTopologyColumnScanState({
          screenX: pos.x,
          scanMinX,
          scanMaxX,
          scannerRisk,
          riskLevel: col.version.riskLevel,
        });
        const visualState = getTopologyColumnVisualState({
          progress: col.progress,
          riskLevel: col.version.riskLevel,
          totalScore: col.version.totalScore,
          isLit: scanState.isLit,
        });

        const beat = Math.sin(scanTime / 160 + col.gx * 0.55 + col.gy * 0.5);
        const breathe = visualState.isRaised && scanState.shouldPulse ? 4 + Math.max(0, beat) * 14 : 0;
        const h = (visualState.height + breathe) * s;
        const groundY = pos.y;
        const topY = groundY - h;

        const hovered = hoverRef.current?.id === col.id;
        const body = getTopologyColumnBody(col.version.riskLevel);
        const widthBoost = visualState.form === 'alertTower' ? 1.18 : visualState.form === 'tower' ? 1.08 : 1;
        const w = body.width * widthBoost * s;
        const d = body.depth * (visualState.isRaised ? 1 : 0.9) * s;
        const { r, g, b } = col.color;

        if (!visualState.isRaised) {
          const tileY = groundY + d * 0.42;
          ctx.save();
          ctx.translate(pos.x, tileY);
          ctx.scale(1, 0.56);
          drawHex(ctx, 0, 0, w * (visualState.form === 'cabinet' ? 1.45 : 1.3));
          ctx.fillStyle = dark ? 'rgba(75,88,98,0.24)' : 'rgba(172,183,194,0.34)';
          ctx.strokeStyle = dark ? 'rgba(170,186,196,0.1)' : 'rgba(84,96,108,0.12)';
          ctx.lineWidth = 0.9;
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = dark ? 'rgba(124,139,148,0.04)' : 'rgba(91,102,112,0.055)';
          ctx.beginPath();
          ctx.ellipse(pos.x, groundY + d * 0.34, w * 1.55, d * 1.1, 0, 0, Math.PI * 2);
          ctx.fill();

          if (visualState.form === 'cabinet') {
            const cw = w * 0.58;
            const cd = d * 0.68;
            ctx.beginPath();
            ctx.moveTo(pos.x - cw, groundY);
            ctx.lineTo(pos.x, groundY + cd);
            ctx.lineTo(pos.x, topY + cd);
            ctx.lineTo(pos.x - cw, topY);
            ctx.closePath();
            ctx.fillStyle = dark ? 'rgba(68,80,90,0.68)' : 'rgba(168,178,188,0.74)';
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(pos.x, groundY + cd);
            ctx.lineTo(pos.x + cw, groundY);
            ctx.lineTo(pos.x + cw, topY);
            ctx.lineTo(pos.x, topY + cd);
            ctx.closePath();
            ctx.fillStyle = dark ? 'rgba(45,56,66,0.72)' : 'rgba(139,151,162,0.76)';
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(pos.x - cw, topY);
            ctx.lineTo(pos.x, topY + cd);
            ctx.lineTo(pos.x + cw, topY);
            ctx.lineTo(pos.x, topY - cd);
            ctx.closePath();
            ctx.fillStyle = dark ? 'rgba(128,143,154,0.76)' : 'rgba(218,225,231,0.86)';
            ctx.fill();
            ctx.strokeStyle = dark ? 'rgba(170,184,194,0.14)' : 'rgba(73,84,96,0.14)';
            ctx.stroke();
          } else {
            ctx.fillStyle = dark ? 'rgba(150,166,176,0.12)' : 'rgba(105,118,132,0.13)';
            ctx.beginPath();
            ctx.moveTo(pos.x - w * 0.42, tileY);
            ctx.lineTo(pos.x, tileY + d * 0.3);
            ctx.lineTo(pos.x + w * 0.42, tileY);
            ctx.lineTo(pos.x, tileY - d * 0.3);
            ctx.closePath();
            ctx.fill();
          }
          continue;
        }

        litCols.push({ col, pos, topY, groundY, width: w, depth: d });
        const activeSignal = 1;
        const faceAlpha = hovered && scanState.isLit ? 0.94 : scanState.isLit ? 0.84 : 0.68;
        const leftFace = scanState.isLit
          ? dark ? `rgba(74,112,132,${faceAlpha})` : `rgba(176,194,202,${faceAlpha})`
          : dark ? 'rgba(76,88,98,0.6)' : 'rgba(181,190,197,0.72)';
        const rightFace = scanState.isLit
          ? dark ? `rgba(34,63,82,${faceAlpha})` : `rgba(128,151,163,${faceAlpha})`
          : dark ? 'rgba(45,58,68,0.64)' : 'rgba(139,149,158,0.68)';
        const topFace = scanState.isLit
          ? dark ? 'rgba(174,216,226,0.92)' : 'rgba(246,252,252,0.96)'
          : dark ? 'rgba(124,139,150,0.72)' : 'rgba(216,223,229,0.86)';
        const rimAlpha = scanState.isLit ? 0.54 : 0.16;
        const sideStripeAlpha = scanState.isLit ? 0.22 : 0.08;
        const floorCount = visualState.windowRows;
        const windows = getTopologyWindowPattern(col.id, floorCount * 2);
        const windowFill = scanState.isLit
          ? `rgba(${r},${g},${b},${dark ? 0.32 : 0.36})`
          : dark ? 'rgba(205,218,226,0.13)' : 'rgba(108,120,132,0.14)';
        const windowOffFill = dark ? 'rgba(18,29,39,0.16)' : 'rgba(255,255,255,0.15)';
        const windowStroke = scanState.isLit
          ? `rgba(${r},${g},${b},${dark ? 0.22 : 0.26})`
          : dark ? 'rgba(224,238,246,0.07)' : 'rgba(60,72,84,0.08)';

        // glow ellipse at base
        ctx.fillStyle = scanState.isLit
          ? `rgba(${r},${g},${b},${hovered ? 0.2 : 0.1})`
          : dark ? 'rgba(124,139,148,0.055)' : 'rgba(91,102,112,0.07)';
        ctx.beginPath();
        ctx.ellipse(pos.x, groundY + d * 0.28, w * 2.15, d * 1.62, 0, 0, Math.PI * 2);
        ctx.fill();

        // LEFT FACE
        ctx.beginPath();
        ctx.moveTo(pos.x - w, groundY);
        ctx.lineTo(pos.x, groundY + d);
        ctx.lineTo(pos.x, topY + d);
        ctx.lineTo(pos.x - w, topY);
        ctx.closePath();
        ctx.fillStyle = leftFace;
        ctx.fill();
        ctx.fillStyle = scanState.isLit
          ? `rgba(${r},${g},${b},${sideStripeAlpha})`
          : dark ? 'rgba(210,224,232,0.055)' : 'rgba(70,82,94,0.05)';
        ctx.beginPath();
        ctx.moveTo(pos.x - w * 0.74, groundY - 2);
        ctx.lineTo(pos.x - w * 0.38, groundY + d * 0.34);
        ctx.lineTo(pos.x - w * 0.38, topY + d * 0.92);
        ctx.lineTo(pos.x - w * 0.74, topY + d * 0.58);
        ctx.closePath();
        ctx.fill();
        for (let floor = 0; floor < floorCount; floor++) {
          const tFloor = (floor + 1) / (floorCount + 1);
          const wy = groundY - h * tFloor + d * 0.42;
          const wx = pos.x - w * 0.64;
          ctx.fillStyle = windows[floor * 2] ? windowFill : windowOffFill;
          ctx.strokeStyle = windowStroke;
          ctx.lineWidth = 0.45;
          ctx.beginPath();
          ctx.roundRect(wx, wy, w * 0.25, Math.max(2.2, d * 0.34), 0.8);
          ctx.fill();
          ctx.stroke();
        }

        // RIGHT FACE
        ctx.beginPath();
        ctx.moveTo(pos.x, groundY + d);
        ctx.lineTo(pos.x + w, groundY);
        ctx.lineTo(pos.x + w, topY);
        ctx.lineTo(pos.x, topY + d);
        ctx.closePath();
        ctx.fillStyle = rightFace;
        ctx.fill();
        ctx.fillStyle = scanState.isLit
          ? `rgba(255,255,255,${dark ? 0.08 : 0.16})`
          : dark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.12)';
        ctx.beginPath();
        ctx.moveTo(pos.x + w * 0.38, groundY + d * 0.34);
        ctx.lineTo(pos.x + w * 0.72, groundY);
        ctx.lineTo(pos.x + w * 0.72, topY + d * 0.56);
        ctx.lineTo(pos.x + w * 0.38, topY + d * 0.9);
        ctx.closePath();
        ctx.fill();
        for (let floor = 0; floor < floorCount; floor++) {
          const tFloor = (floor + 1) / (floorCount + 1);
          const wy = groundY - h * tFloor + d * 0.38;
          const wx = pos.x + w * 0.36;
          ctx.fillStyle = windows[floor * 2 + 1] ? windowFill : windowOffFill;
          ctx.strokeStyle = windowStroke;
          ctx.lineWidth = 0.45;
          ctx.beginPath();
          ctx.roundRect(wx, wy, w * 0.26, Math.max(2.2, d * 0.34), 0.8);
          ctx.fill();
          ctx.stroke();
        }

        // TOP FACE
        ctx.beginPath();
        ctx.moveTo(pos.x - w, topY);
        ctx.lineTo(pos.x, topY + d);
        ctx.lineTo(pos.x + w, topY);
        ctx.lineTo(pos.x, topY - d);
        ctx.closePath();
        ctx.fillStyle = topFace;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = scanState.isLit
          ? `rgba(${r},${g},${b},${hovered ? 0.34 : 0.22})`
          : dark ? 'rgba(170,185,196,0.12)' : 'rgba(120,132,144,0.12)';
        ctx.beginPath();
        ctx.moveTo(pos.x - w * 0.46, topY + d * 0.04);
        ctx.lineTo(pos.x, topY + d * 0.46);
        ctx.lineTo(pos.x + w * 0.46, topY + d * 0.04);
        ctx.lineTo(pos.x, topY - d * 0.42);
        ctx.closePath();
        ctx.fill();

        // visible edges of the 3D column, with risk color as a thin signal only
        ctx.strokeStyle = scanState.isLit
          ? dark ? 'rgba(226,246,255,0.24)' : 'rgba(40,78,92,0.18)'
          : dark ? 'rgba(160,174,184,0.15)' : 'rgba(76,86,96,0.13)';
        ctx.lineWidth = hovered && scanState.isLit ? 1.5 : 0.9;
        ctx.beginPath();
        ctx.moveTo(pos.x - w, groundY);
        ctx.lineTo(pos.x - w, topY);
        ctx.lineTo(pos.x, topY - d);
        ctx.lineTo(pos.x + w, topY);
        ctx.lineTo(pos.x + w, groundY);
        ctx.stroke();
        ctx.strokeStyle = scanState.isLit
          ? `rgba(${r},${g},${b},${(hovered ? 0.7 : rimAlpha) * activeSignal})`
          : dark ? 'rgba(168,181,190,0.12)' : 'rgba(73,84,96,0.12)';
        ctx.beginPath();
        ctx.moveTo(pos.x, topY - d);
        ctx.lineTo(pos.x, topY + d);
        ctx.lineTo(pos.x, groundY + d);
        ctx.stroke();

        // compact sensor cap instead of a point-like light bead
        ctx.fillStyle = scanState.isLit
          ? `rgba(${r},${g},${b},0.72)`
          : dark ? 'rgba(174,187,196,0.28)' : 'rgba(99,112,126,0.24)';
        ctx.shadowColor = scanState.isLit ? `rgba(${r},${g},${b},0.34)` : 'rgba(0,0,0,0)';
        ctx.shadowBlur = scanState.isLit ? hovered ? 14 : 7 : 0;
        ctx.beginPath();
        ctx.ellipse(pos.x, topY + d * 0.05, w * 0.34, d * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (visualState.hasAlertCap) {
          const capY = topY - d * 0.8;
          ctx.fillStyle = `rgba(${r},${g},${b},${dark ? 0.82 : 0.74})`;
          ctx.strokeStyle = dark ? 'rgba(255,245,230,0.32)' : 'rgba(92,38,46,0.24)';
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(pos.x, capY - d * 0.45);
          ctx.lineTo(pos.x + w * 0.58, capY + d * 0.38);
          ctx.lineTo(pos.x - w * 0.58, capY + d * 0.38);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = dark ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.9)';
          ctx.fillRect(pos.x - 0.7, capY - d * 0.2, 1.4, d * 0.32);
          ctx.beginPath();
          ctx.arc(pos.x, capY + d * 0.24, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // hover ring
        if (hovered && scanState.isLit) {
          ctx.strokeStyle = `rgba(${r},${g},${b},0.8)`;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(pos.x, topY, w + 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // energy particles
        if (scanState.shouldPulse) {
          for (let p = 0; p < 3; p++) {
            const prog = ((scanTime / 600 + p * 0.35) % 1);
            const py = groundY - h * prog;
            ctx.fillStyle = `rgba(255,255,255,${0.22 + 0.2 * (1 - prog)})`;
            ctx.beginPath();
            ctx.roundRect(pos.x - w * 0.38, py, w * 0.76, 1.3, 1);
            ctx.fill();
          }
        }

        // HUD label
        if (scanState.isLit && (col.gx + col.gy) % 6 === 0) {
          const lx = pos.x + w + 8;
          const ly = topY - 14;
          ctx.fillStyle = dark ? 'rgba(4,14,26,0.72)' : 'rgba(255,255,255,0.82)';
          ctx.strokeStyle = `rgba(${r},${g},${b},0.22)`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.roundRect(lx, ly, 96, 24, 4);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = dark ? '#e0f0ff' : '#0f172a';
          ctx.font = '700 9px "Microsoft YaHei", sans-serif';
          ctx.fillText(`${col.version.sysId} #${col.version.patchId}`, lx + 5, ly + 11);
          ctx.fillStyle = dark ? '#8ac8d8' : '#475569';
          ctx.font = '8px "Microsoft YaHei", sans-serif';
          ctx.fillText(`${col.version.totalScore.toFixed(1)}分 ${col.version.status}`, lx + 5, ly + 21);
        }
      }
      visibleColsRef.current = litCols;

      // topology network between scanned and lit columns
      for (let i = 0; i < litCols.length; i++) {
        const a = litCols[i];
        for (let j = i + 1; j < litCols.length; j++) {
          const b = litCols[j];
          const gridDx = Math.abs(a.col.gx - b.col.gx);
          const gridDy = Math.abs(a.col.gy - b.col.gy);
          if (gridDx + gridDy > 3) continue;
          if (gridDx === 0 && gridDy > 1) continue;
          const sameSys = a.col.version.sysId === b.col.version.sysId;
          const alpha = sameSys ? 0.2 : 0.07;
          ctx.strokeStyle = sameSys
            ? `rgba(${a.col.color.r},${a.col.color.g},${a.col.color.b},${alpha})`
            : dark ? `rgba(150,218,235,${alpha})` : `rgba(77,116,130,${alpha})`;
          ctx.lineWidth = sameSys ? 1 : 0.4;
          ctx.beginPath();
          ctx.moveTo(a.pos.x, a.topY);
          ctx.lineTo(b.pos.x, b.topY);
          ctx.stroke();
        }
      }

      // drone
      ctx.save();
      ctx.shadowColor = `rgba(${scannerColor},${dark ? 0.5 : 0.32})`;
      ctx.shadowBlur = 24;
      ctx.translate(dx, dy);
      ctx.rotate(Math.sin(scanTime / 1100) * 0.25);
      ctx.fillStyle = `rgb(${scannerColor})`;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(11, 6);
      ctx.lineTo(0, 2);
      ctx.lineTo(-11, 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-28, -1, 56, 2.5);
      ctx.beginPath();
      ctx.arc(0, 4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      frame = requestAnimationFrame(render);
    };

    const hitTest = (x: number, y: number) => {
      const visibleColumns = visibleColsRef.current;
      for (let i = visibleColumns.length - 1; i >= 0; i--) {
        const item = visibleColumns[i];
        if (scannerRisk !== 'ALL' && item.col.version.riskLevel !== scannerRisk) continue;
        const hitWidth = Math.max(18, item.width * 2.2);
        if (
          Math.abs(x - item.pos.x) < hitWidth &&
          y > item.topY - item.depth - 12 &&
          y < item.groundY + item.depth + 10
        ) {
          return item.col;
        }
      }
      return null;
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const h = hitTest(mx, my);
      hoverRef.current = h;
      setHover(h);
      canvas.style.cursor = h ? 'pointer' : 'default';
    };
    const onDown = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const h = hitTest(e.clientX - r.left, e.clientY - r.top);
      if (h) nav(`/versions/${h.version.patchId}`, { state: detailState ?? { from: '/', fromLabel: '返回首页' } });
    };
    const onLeave = () => {
      hoverRef.current = null;
      setHover(null);
      canvas.style.cursor = 'default';
    };

    resize();
    scanTimeRef.current = 0;
    lastFrameTimeRef.current = null;
    const obs = new ResizeObserver(resize);
    obs.observe(w);
    canvas.style.cursor = 'default';
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mouseleave', onLeave);
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      obs.disconnect();
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [detailState, nav, scannerRisk]);

  return (
    <div ref={wrap} className="l1-dynamic-topology">
      <canvas ref={cvs} aria-label="AI 守护者扫描版本宇宙" />
      <div className="l1-scan-hint">AI Guardian 自动巡检 · 单击进入 L3</div>
      {hover ? (
        <div className="l1-topology-tip">
          <strong>{hover.version.subNamedSystemName}</strong>
          <span>{hover.version.sysId} / {hover.version.riskLevel} / {hover.version.totalScore.toFixed(1)}分</span>
        </div>
      ) : null}
    </div>
  );
}

export default DynamicTopology;
