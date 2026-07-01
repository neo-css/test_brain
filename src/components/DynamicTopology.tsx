import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { VersionDetail } from '../data/versionMock';

type ScannerRisk = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';

const COLS = 14;
const ROWS = 8;
const SPACING = 52;
const MAX_NODES = COLS * ROWS;

function riskRGB(risk: string) {
  if (risk === 'HIGH') return { r: 218, g: 82, b: 98 };
  if (risk === 'MEDIUM') return { r: 201, g: 148, b: 64 };
  return { r: 58, g: 168, b: 154 };
}

function scannerRGB(risk: ScannerRisk) {
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
  baseH: number;
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
    const penalty = Math.max(0, 95 - v.totalScore);
    return {
      id: `${v.sysId}-${v.patchId}`,
      gx: i % COLS,
      gy: Math.floor(i / COLS),
      baseH: 36 + penalty * 1.1 + (v.riskLevel === 'HIGH' ? 28 : v.riskLevel === 'MEDIUM' ? 16 : 6),
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
}: {
  versions: VersionDetail[];
  scannerRisk?: ScannerRisk;
  scannerSpeed?: number;
}) {
  const nav = useNavigate();
  const cvs = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const colsRef = useRef<Column[]>([]);
  const visibleColsRef = useRef<VisibleColumn[]>([]);
  const hoverRef = useRef<Column | null>(null);
  const scanTimeRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const [hover, setHover] = useState<Column | null>(null);

  useEffect(() => { colsRef.current = buildColumns(versions); }, [versions]);

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
      if (!hoverRef.current) scanTimeRef.current += frameDelta * scannerSpeed;
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
      const scanner = scannerRGB(scannerRisk);
      const scannerFocus = scannerRisk !== 'ALL';
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

      const scannedCols: VisibleColumn[] = [];

      for (const col of columns) {
        const pos = screenPos(col.gx, col.gy, cx, cy, s);
        if (pos.x <= scanMinX || pos.x >= scanMaxX) continue;
        const beat = Math.sin(scanTime / 160 + col.gx * 0.55 + col.gy * 0.5);
        const breathe = 4 + Math.max(0, beat) * 14;
        const h = (col.baseH + breathe) * s;
        const groundY = pos.y;
        const topY = groundY - h;

        const hovered = hoverRef.current?.id === col.id;
        const w = (col.version.riskLevel === 'HIGH' ? 11 : col.version.riskLevel === 'MEDIUM' ? 9 : 7) * s;
        const d = w * 0.45;
        scannedCols.push({ col, pos, topY, groundY, width: w, depth: d });
        const { r, g, b } = col.color;
        const matchesScanner = scannerRisk === 'ALL' || col.version.riskLevel === scannerRisk;
        const activeSignal = matchesScanner ? 1 : 0.22;
        const faceAlpha = hovered ? 0.86 : 0.74;
        const leftFace = dark ? `rgba(82,116,136,${faceAlpha})` : `rgba(178,196,204,${faceAlpha})`;
        const rightFace = dark ? `rgba(38,66,86,${faceAlpha})` : `rgba(132,156,168,${faceAlpha})`;
        const topFace = dark ? 'rgba(164,207,220,0.88)' : 'rgba(246,252,252,0.94)';

        // glow ellipse at base
        ctx.fillStyle = `rgba(${r},${g},${b},${(hovered ? 0.18 : 0.09) * activeSignal})`;
        ctx.beginPath();
        ctx.ellipse(pos.x, groundY, w * 2.35, d * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // LEFT FACE
        ctx.beginPath();
        ctx.moveTo(pos.x - w, groundY);
        ctx.lineTo(pos.x, groundY + d);
        ctx.lineTo(pos.x, topY + d);
        ctx.lineTo(pos.x - w, topY);
        ctx.closePath();
        ctx.globalAlpha = matchesScanner ? 1 : 0.42;
        ctx.fillStyle = leftFace;
        ctx.fill();

        // RIGHT FACE
        ctx.beginPath();
        ctx.moveTo(pos.x, groundY + d);
        ctx.lineTo(pos.x + w, groundY);
        ctx.lineTo(pos.x + w, topY);
        ctx.lineTo(pos.x, topY + d);
        ctx.closePath();
        ctx.fillStyle = rightFace;
        ctx.fill();

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

        // visible edges of the 3D column, with risk color as a thin signal only
        ctx.strokeStyle = matchesScanner
          ? dark ? 'rgba(226,246,255,0.18)' : 'rgba(40,78,92,0.13)'
          : dark ? 'rgba(226,246,255,0.08)' : 'rgba(40,78,92,0.05)';
        ctx.lineWidth = hovered ? 1.4 : 0.8;
        ctx.beginPath();
        ctx.moveTo(pos.x - w, groundY);
        ctx.lineTo(pos.x - w, topY);
        ctx.lineTo(pos.x, topY - d);
        ctx.lineTo(pos.x + w, topY);
        ctx.lineTo(pos.x + w, groundY);
        ctx.stroke();
        ctx.strokeStyle = `rgba(${r},${g},${b},${(hovered ? 0.62 : 0.32) * activeSignal})`;
        ctx.beginPath();
        ctx.moveTo(pos.x, topY - d);
        ctx.lineTo(pos.x, topY + d);
        ctx.lineTo(pos.x, groundY + d);
        ctx.stroke();

        // top glow dot
        ctx.fillStyle = `rgba(${r},${g},${b},${0.88 * activeSignal})`;
        ctx.shadowColor = `rgba(${r},${g},${b},${0.42 * activeSignal})`;
        ctx.shadowBlur = hovered ? 18 : 10;
        ctx.beginPath();
        ctx.arc(pos.x, topY, w * 0.36, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // hover ring
        if (hovered && matchesScanner) {
          ctx.strokeStyle = `rgba(${r},${g},${b},0.8)`;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(pos.x, topY, w + 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // energy particles
        for (let p = 0; p < 3; p++) {
          const prog = ((scanTime / 600 + p * 0.35) % 1);
          const py = groundY - h * prog;
          ctx.fillStyle = matchesScanner ? `rgba(255,255,255,0.55)` : 'rgba(255,255,255,0.12)';
          ctx.beginPath();
          ctx.arc(pos.x, py, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }

        // HUD label
        if (matchesScanner && (col.gx + col.gy) % 6 === 0) {
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
      visibleColsRef.current = scannedCols;

      // topology network between scanned columns
      for (let i = 0; i < scannedCols.length; i++) {
        const a = scannedCols[i];
        for (let j = i + 1; j < scannedCols.length; j++) {
          const b = scannedCols[j];
          const dx = Math.abs(a.col.gx - b.col.gx);
          const dy = Math.abs(a.col.gy - b.col.gy);
          if (dx + dy > 3) continue;
          if (dx === 0 && dy > 1) continue;
          const aMatches = scannerRisk === 'ALL' || a.col.version.riskLevel === scannerRisk;
          const bMatches = scannerRisk === 'ALL' || b.col.version.riskLevel === scannerRisk;
          if (scannerFocus && (!aMatches || !bMatches)) continue;
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
      if (h) nav(`/versions/${h.version.patchId}`, { state: { from: '/', fromLabel: '返回测试大脑' } });
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
  }, [nav, scannerRisk, scannerSpeed]);

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
