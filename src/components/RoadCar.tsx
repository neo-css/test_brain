import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Gauge,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { formatScore, riskLabel, VersionDetail } from '../data/versionMock';
import { assignDamageLevel, damageLabel, DamageLevel, getReleaseDate } from '../pages/versionRoadGrouping';

interface RoadCarProps {
  version: VersionDetail;
}

interface TooltipPos {
  left: number;
  top: number;
  arrowOffset: number;
  arrowAtTop: boolean;
}

function carBodyColor(damage: DamageLevel) {
  switch (damage) {
    case 0:
      return 'var(--road-car-good)';
    case 1:
      return 'var(--road-car-fair)';
    case 2:
      return 'var(--road-car-warn)';
    case 3:
    case 4:
    default:
      return 'var(--road-car-bad)';
  }
}

function riskIcon(risk: string) {
  switch (risk) {
    case 'LOW':
      return <CheckCircle2 size={14} aria-hidden="true" />;
    case 'MEDIUM':
      return <AlertTriangle size={14} aria-hidden="true" />;
    case 'HIGH':
      return <AlertCircle size={14} aria-hidden="true" />;
    default:
      return <XCircle size={14} aria-hidden="true" />;
  }
}

const TOOLTIP_WIDTH = 248;
const MIN_TOP_SPACE = 170;
const GAP = 12;

function computeTooltipPos(rect: DOMRect): TooltipPos {
  const centerX = rect.left + rect.width / 2;
  let left = centerX - TOOLTIP_WIDTH / 2;
  let arrowOffset = 0;

  const viewportWidth = window.innerWidth;
  if (left < 8) {
    arrowOffset = left - 8;
    left = 8;
  } else if (left + TOOLTIP_WIDTH > viewportWidth - 8) {
    arrowOffset = left + TOOLTIP_WIDTH - (viewportWidth - 8);
    left = viewportWidth - 8 - TOOLTIP_WIDTH;
  }

  const arrowAtTop = rect.top < MIN_TOP_SPACE;
  const top = arrowAtTop ? rect.bottom + GAP : rect.top - GAP;

  return { left, top, arrowOffset, arrowAtTop };
}

function RoadCar({ version }: RoadCarProps) {
  const carRef = useRef<HTMLAnchorElement>(null);
  const [tooltip, setTooltip] = useState<TooltipPos | null>(null);
  const rafRef = useRef<number | null>(null);
  const damage = assignDamageLevel(version.totalScore);
  const risk = version.riskLevel.toLowerCase();
  const ariaLabel = `${version.sysId} 版本 ${version.patchId}，总分 ${formatScore(version.totalScore)}，${riskLabel(version.riskLevel)}，${damageLabel(damage)}`;
  const showMotionLines = damage === 0;
  const showSlowIndicator = damage === 2;
  const showSmoke = damage >= 3;
  const showSpark = damage >= 3;
  const showStall = damage === 4;

  const updateTooltip = useCallback(() => {
    const rect = carRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip(computeTooltipPos(rect));
  }, []);

  const showTooltip = useCallback(() => {
    updateTooltip();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const loop = () => {
      updateTooltip();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [updateTooltip]);

  const hideTooltip = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setTooltip(null);
  }, []);

  useEffect(() => {
    if (!tooltip) return undefined;
    const handleUpdate = () => updateTooltip();
    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate);
    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [tooltip, updateTooltip]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <>
      <Link
        ref={carRef}
        to={`/versions/${version.patchId}`}
        className={`road-car damage-${damage} risk-${risk}`}
        aria-label={ariaLabel}
        title=""
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {showMotionLines && (
          <span className="car-motion-lines" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        )}
        {showSlowIndicator && (
          <span className="car-slow-waves" aria-hidden="true">
            <i />
            <i />
          </span>
        )}
        {showSmoke && (
          <span className="car-smoke" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        )}
        {showSpark && (
          <span className="car-spark" aria-hidden="true">
            <i />
            <i />
          </span>
        )}
        {damage >= 3 && (
          <span className="car-mechanic-helper" aria-hidden="true">
            <svg viewBox="0 0 44 38" className="mechanic-svg" focusable="false">
              <ellipse cx="22" cy="35" rx="15" ry="2.4" className="mechanic-ground" />
              <path d="M10 8 Q12 3 18 3 Q24 3 27 8 L27 10 L10 10 Z" className="mechanic-helmet" />
              <path d="M14 5 H23" className="mechanic-helmet-line" />
              <circle cx="18.5" cy="14" r="5" className="mechanic-face" />
              <path d="M15 13 H22" className="mechanic-visor" />
              <path d="M13 21 Q16 18 21 19 Q25 20 26 24 L27 31 L12 31 L11 24 Q11 22 13 21 Z" className="mechanic-torso" />
              <path d="M25 23 L35 18" className="mechanic-arm-right" />
              <path d="M34 16 L39 20 M35 18 L40 14" className="mechanic-wrench-lines" />
              <path d="M16 31 L13 36" className="mechanic-leg-left" />
              <path d="M23 31 L27 36" className="mechanic-leg-right" />
              <rect x="29" y="29" width="10" height="6" rx="1.5" className="mechanic-toolbox" />
            </svg>
          </span>
        )}
        <svg viewBox="0 0 96 56" className="car-svg" aria-hidden="true">
          <defs>
            <linearGradient id={`car-body-${version.patchId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={carBodyColor(damage)} stopOpacity="1" />
              <stop offset="100%" stopColor={carBodyColor(damage)} stopOpacity="0.78" />
            </linearGradient>
          </defs>
          {/* car shadow */}
          <ellipse cx="48" cy="50" rx="34" ry="3" className="car-shadow" />
          {/* car body */}
          <path
            d="M10,38 L18,22 Q22,16 30,16 L62,16 Q72,16 78,22 L86,30 L86,40 Q86,44 82,44 L14,44 Q10,44 10,40 Z"
            fill={`url(#car-body-${version.patchId})`}
            className="car-body"
          />
          <path
            d="M14,36 L21,23 Q25,15 33,15 L61,15 Q72,15 79,23 L86,31"
            className="car-body-rim"
          />
          <path d="M22,24 Q28,20 40,20 L60,20 Q68,20 74,25" className="car-body-highlight" />
          <path d="M14,39 L82,39" className="car-lower-line" />
          <path d="M78,29 L86,33 L86,38" className="car-front-bumper" />
          <rect x="11" y="34" width="5" height="4" rx="1.5" className="car-tail-light" />
          {/* windows */}
          <path d="M28,22 L60,22 L66,32 L24,32 Z" className="car-window" />
          <line x1="44" y1="22" x2="44" y2="32" className="car-window-frame" />
          <line x1="31" y1="24" x2="58" y2="24" className="car-window-shine" />
          <line x1="51" y1="34" x2="51" y2="42" className="car-door-seam" />
          {damage === 1 && (
            <g className="car-clearcoat-marks">
              <line x1="30" y1="36" x2="43" y2="34.5" />
              <line x1="55" y1="36" x2="66" y2="35" />
            </g>
          )}
          {damage === 2 && (
            <g className="car-moderate-damage">
              <path d="M60,38 Q68,31 78,38 Q70,43 60,38 Z" className="car-dent" />
              <line x1="24" y1="36" x2="38" y2="33.5" />
              <line x1="44" y1="39" x2="58" y2="36" />
              <path d="M73,22 L82,34 L64,34 Z" className="car-warning-mark" />
            </g>
          )}
          {damage >= 3 && (
            <g className="car-heavy-damage">
              <path d="M62,38 Q68,33 76,38 Q70,42 62,38 Z" className="car-dent" />
              <line x1="24" y1="36" x2="38" y2="33.5" />
              <line x1="44" y1="39" x2="58" y2="36" />
            </g>
          )}
          {damage >= 3 && (
            <g className="car-crack">
              <path d="M20,30 L26,34 L22,38" />
              <path d="M70,28 L74,32 L70,36" />
            </g>
          )}
          {/* wheels */}
          <g className={`car-wheels ${showStall ? 'wheels-broken' : ''}`}>
            {showStall ? (
              <>
                <circle cx="26" cy="44" r="6" className="car-wheel wheel-off" />
                <circle cx="68" cy="46" r="7" className="car-wheel" />
                <line x1="34" y1="50" x2="46" y2="50" className="car-bolt-trail" />
              </>
            ) : (
              <>
                <circle cx="26" cy="46" r="7" className="car-wheel" />
                <circle cx="68" cy="46" r="7" className="car-wheel" />
                <circle cx="26" cy="46" r="4.5" className="car-rim" />
                <circle cx="68" cy="46" r="4.5" className="car-rim" />
                <circle cx="26" cy="46" r="2.5" className="car-hub" />
                <circle cx="68" cy="46" r="2.5" className="car-hub" />
              </>
            )}
          </g>
        {/* headlight */}
        <circle cx="83" cy="34" r="2.5" className={`car-headlight ${damage >= 3 ? 'flash-red' : ''}`} />
          {/* checkmark for perfect */}
          {damage === 0 && (
            <path d="M44,26 L48,30 L56,22" className="car-check" fill="none" />
          )}
          {/* wrench animation for repair states */}
          {damage >= 3 && (
            <g className="car-wrench">
              <path
                d="M38,8 a4,4 0 1 0 4,4 L48,18 L52,14 L46,8 Z"
                transform="translate(0,0)"
              />
            </g>
          )}
        </svg>

      </Link>

      {tooltip && createPortal(
        <span
          className={`car-summary car-summary-fixed ${tooltip.arrowAtTop ? 'car-summary-arrow-top' : ''}`}
          role="tooltip"
          style={{
            left: tooltip.left,
            top: tooltip.top,
            '--car-summary-arrow-offset': `${tooltip.arrowOffset}px`,
          } as React.CSSProperties}
        >
          <span className="car-summary-head">
            <strong>{version.sysId}</strong>
            <span className={`car-summary-risk risk-${risk}`}>
              {riskIcon(version.riskLevel)}
              {riskLabel(version.riskLevel)}
            </span>
          </span>
          <span className="car-summary-title">
            <Gauge size={14} aria-hidden="true" />
            总分 <em>{formatScore(version.totalScore)}</em>
            <span className="car-summary-status">{version.status}</span>
          </span>
          <span className="car-summary-meta">
            <span>
              <Users size={12} aria-hidden="true" />
              {version.teamName}
            </span>
            <span>
              <User size={12} aria-hidden="true" />
              {version.patchOwner}
            </span>
            <span className="car-summary-date">{getReleaseDate(version)}</span>
          </span>
          {version.summary && (
            <span className="car-summary-desc">
              <FileText size={12} aria-hidden="true" />
              {version.summary}
            </span>
          )}
        </span>,
        document.body,
      )}
    </>
  );
}

export default RoadCar;
