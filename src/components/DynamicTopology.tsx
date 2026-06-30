import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { VersionDetail } from '../data/versionMock';

type DomainNode = {
  id: string;
  name: string;
  code: string;
  color: string;
  x: number;
  y: number;
};

type TopoNode =
  | (DomainNode & { type: 'domain'; r: number })
  | {
      type: 'system';
      id: string;
      name: string;
      code: string;
      color: string;
      x: number;
      y: number;
      r: number;
      patchId: number;
      domainId: string;
      risk: string;
    };

const domains: DomainNode[] = [
  { id: 'pay', name: '支付交易域', code: 'PAY', color: '#3f9ed5', x: 0, y: 0 },
  { id: 'risk', name: '安全风控域', code: 'RISK', color: '#df8d43', x: 0, y: 0 },
  { id: 'clr', name: '清算结算域', code: 'CLR', color: '#42afa5', x: 0, y: 0 },
  { id: 'mch', name: '商户服务域', code: 'MCH', color: '#d3a943', x: 0, y: 0 },
  { id: 'wlt', name: '账户钱包域', code: 'WLT', color: '#8587db', x: 0, y: 0 },
  { id: 'data', name: '数据智能域', code: 'DATA', color: '#45afca', x: 0, y: 0 },
];

function riskColor(risk: string) {
  if (risk === 'HIGH') return '#e36557';
  if (risk === 'MEDIUM') return '#e5a94b';
  return '#42afa5';
}

function drawSphere(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, glow = 0) {
  if (glow) {
    const glowGrad = ctx.createRadialGradient(x, y, r * 0.7, x, y, r + glow);
    glowGrad.addColorStop(0, `${color}88`);
    glowGrad.addColorStop(1, `${color}00`);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, y, r + glow, 0, Math.PI * 2);
    ctx.fill();
  }

  const grad = ctx.createRadialGradient(x - r * 0.38, y - r * 0.38, r * 0.12, x, y, r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.22, color);
  grad.addColorStop(1, `${color}88`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function buildLayout(width: number, height: number, versions: VersionDetail[]) {
  const cx = width / 2;
  const cy = height / 2 + 8;
  const domainRadius = Math.min(width, height) * 0.29;
  const nodes: TopoNode[] = [];
  const links: { from: TopoNode | { x: number; y: number; id: string; color: string }; to: TopoNode; color: string; speed: number }[] = [];
  const center = { id: 'center', x: cx, y: cy, color: '#57bccc' };

  const domainNodes = domains.map((domain, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / domains.length;
    const jitter = index % 2 === 0 ? -12 : 12;
    const node: TopoNode = {
      ...domain,
      type: 'domain',
      x: cx + Math.cos(angle) * (domainRadius + jitter),
      y: cy + Math.sin(angle) * (domainRadius * 0.78 + jitter * 0.2),
      r: 15,
    };
    nodes.push(node);
    links.push({ from: center, to: node, color: domain.color, speed: 0.35 + index * 0.05 });
    return node;
  });

  versions.slice(0, 90).forEach((version, index) => {
    const domain = domainNodes[index % domainNodes.length];
    const angle = index * 2.399963 + (index % 6) * 0.16;
    const ring = 34 + (index % 7) * 10;
    const node: TopoNode = {
      type: 'system',
      id: `${version.sysId}-${version.patchId}`,
      name: version.subNamedSystemName,
      code: version.sysId,
      color: riskColor(version.riskLevel),
      x: domain.x + Math.cos(angle) * ring,
      y: domain.y + Math.sin(angle) * ring * 0.68,
      r: version.riskLevel === 'HIGH' ? 5.4 : version.riskLevel === 'MEDIUM' ? 4.7 : 4.1,
      patchId: version.patchId,
      domainId: domain.id,
      risk: version.riskLevel,
    };
    nodes.push(node);
    links.push({ from: domain, to: node, color: domain.color, speed: 0.5 + (index % 5) * 0.08 });
  });

  return { center, nodes, links };
}

function DynamicTopology({
  versions,
  selectedPatchId,
  onSelectVersion,
}: {
  versions: VersionDetail[];
  selectedPatchId?: number | null;
  onSelectVersion?: (patchId: number | null) => void;
}) {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<ReturnType<typeof buildLayout> | null>(null);
  const hoverRef = useRef<TopoNode | null>(null);
  const [hover, setHover] = useState<TopoNode | null>(null);
  const stars = useMemo(
    () => Array.from({ length: 80 }, (_, index) => ({
      x: (index * 37) % 100,
      y: (index * 61) % 100,
      size: 0.45 + (index % 4) * 0.18,
      alpha: 0.12 + (index % 5) * 0.05,
    })),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !wrap || !ctx) return;

    let frame = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const width = wrap.clientWidth;
      const height = wrap.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layoutRef.current = buildLayout(width, height, versions);
    };

    const render = (time: number) => {
      const width = wrap.clientWidth;
      const height = wrap.clientHeight;
      const layout = layoutRef.current;
      if (!layout) return;

      ctx.clearRect(0, 0, width, height);
      const bg = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.62);
      bg.addColorStop(0, '#ffffff');
      bg.addColorStop(0.62, '#f2fbfd');
      bg.addColorStop(1, '#e7f3f8');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        ctx.fillStyle = `rgba(61, 143, 170, ${star.alpha + Math.sin(time / 900 + star.x) * 0.04})`;
        ctx.beginPath();
        ctx.arc((star.x / 100) * width, (star.y / 100) * height, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      const pulse = (Math.sin(time / 700) + 1) / 2;
      const centerGlow = ctx.createRadialGradient(layout.center.x, layout.center.y, 10, layout.center.x, layout.center.y, 82 + pulse * 14);
      centerGlow.addColorStop(0, 'rgba(102, 210, 205, 0.28)');
      centerGlow.addColorStop(1, 'rgba(102, 210, 205, 0)');
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.arc(layout.center.x, layout.center.y, 92, 0, Math.PI * 2);
      ctx.fill();

      for (const link of layout.links) {
        ctx.strokeStyle = `${link.color}5c`;
        ctx.lineWidth = link.to.type === 'domain' ? 1.8 : 0.9;
        ctx.beginPath();
        ctx.moveTo(link.from.x, link.from.y);
        ctx.lineTo(link.to.x, link.to.y);
        ctx.stroke();

        const t = ((time / 1000) * link.speed) % 1;
        const x = link.from.x + (link.to.x - link.from.x) * t;
        const y = link.from.y + (link.to.y - link.from.y) * t;
        drawSphere(ctx, x, y, link.to.type === 'domain' ? 2.8 : 1.8, link.color, 7);
      }

      drawSphere(ctx, layout.center.x, layout.center.y, 26, '#68c6d3', 36);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(layout.center.x, layout.center.y, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#42b9ad';
      ctx.font = '900 18px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('点亮测试', layout.center.x, layout.center.y + 6);

      for (const node of layout.nodes) {
        const isHover = hoverRef.current?.id === node.id;
        const isSelected = node.type === 'system' && node.patchId === selectedPatchId;
        drawSphere(ctx, node.x, node.y, isSelected ? node.r + 2 : node.r, node.color, node.type === 'domain' || isHover || isSelected ? 16 : node.risk === 'HIGH' ? 10 : 4);
        if (isSelected) {
          ctx.strokeStyle = '#183b4a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r + 6, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (node.type === 'domain') {
          ctx.fillStyle = '#244d5e';
          ctx.font = '700 12px "Microsoft YaHei", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(node.code, node.x, node.y + 4);
          ctx.font = '600 11px "Microsoft YaHei", sans-serif';
          ctx.fillText(node.name, node.x, node.y + node.r + 14);
        }
      }

      frame = requestAnimationFrame(render);
    };

    const hitTest = (x: number, y: number) => {
      const layout = layoutRef.current;
      if (!layout) return null;
      for (let index = layout.nodes.length - 1; index >= 0; index--) {
        const node = layout.nodes[index];
        if (Math.hypot(x - node.x, y - node.y) <= node.r + 7) return node;
      }
      return null;
    };

    const onMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const hit = hitTest(event.clientX - rect.left, event.clientY - rect.top);
      hoverRef.current = hit;
      setHover(hit);
      canvas.style.cursor = hit ? 'pointer' : 'default';
    };

    const onClick = () => {
      const hit = hoverRef.current;
      if (!hit) return;
      if (hit.type === 'system') onSelectVersion?.(hit.patchId);
      else {
        onSelectVersion?.(null);
        navigate('/versions', { state: { from: '/', fromLabel: '返回测试大脑' } });
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('click', onClick);
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('click', onClick);
    };
  }, [navigate, onSelectVersion, selectedPatchId, stars, versions]);

  return (
    <div ref={wrapRef} className="l1-dynamic-topology">
      <canvas ref={canvasRef} aria-label="测试大脑动态拓扑" />
      {hover ? (
        <div className="l1-topology-tip">
          <strong>{hover.name}</strong>
          <span>{hover.type === 'system' ? `${hover.code} · 点击选中版本点` : `${hover.code} · 点击进入版本列表`}</span>
        </div>
      ) : null}
    </div>
  );
}

export default DynamicTopology;
