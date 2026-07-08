import RoadCar from './RoadCar';
import { VersionDetail } from '../data/versionMock';
import { RoadDay, shortDateLabel, weekdayLabel } from '../pages/versionRoadGrouping';

interface RoadSnakeCanvasProps {
  days: RoadDay[];
}

const VIEWBOX_WIDTH = 1100;
const ROAD_LEFT = 150;
const ROAD_RIGHT = 950;
const ROAD_TOP = 76;
const ROW_GAP = 128;
const TURN_PULL = 58;
const DATE_SIGN_OFFSET = 72;
const CAR_SAFE_WIDTH = 84;
const CAR_LANE_SPACING = 48.9;
const CAR_MAX_LANES = 2;
const CAR_ROW_STAGGER = [0.075, -0.075] as const;

function buildSnakePath(days: RoadDay[]) {
  if (days.length === 0) return '';

  const commands = [`M ${ROAD_LEFT} ${ROAD_TOP}`];

  days.forEach((_, index) => {
    const y = ROAD_TOP + index * ROW_GAP;
    const nextY = ROAD_TOP + (index + 1) * ROW_GAP;
    const isLeftToRight = index % 2 === 0;

    commands.push(`L ${isLeftToRight ? ROAD_RIGHT : ROAD_LEFT} ${y}`);

    if (index < days.length - 1) {
      if (isLeftToRight) {
        commands.push(`C ${ROAD_RIGHT + TURN_PULL} ${y} ${ROAD_RIGHT + TURN_PULL} ${nextY} ${ROAD_RIGHT} ${nextY}`);
      } else {
        commands.push(`C ${ROAD_LEFT - TURN_PULL} ${y} ${ROAD_LEFT - TURN_PULL} ${nextY} ${ROAD_LEFT} ${nextY}`);
      }
    }
  });

  return commands.join(' ');
}

function getRowY(index: number) {
  return ROAD_TOP + index * ROW_GAP;
}

function getDateLabelPosition(index: number, totalRows: number) {
  const isRightBend = index % 2 === 0;
  const x = isRightBend ? ROAD_RIGHT + DATE_SIGN_OFFSET : ROAD_LEFT - DATE_SIGN_OFFSET;

  return {
    left: `${x / VIEWBOX_WIDTH * 100}%`,
    top: `${getRowY(index) / getCanvasHeight(totalRows) * 100}%`,
  };
}

function getDateMarkerClassName(index: number) {
  return `snake-date-marker ${index % 2 === 0 ? 'snake-date-marker-right' : 'snake-date-marker-left'}`;
}

function getCanvasHeight(totalRows: number) {
  return ROAD_TOP * 2 + Math.max(0, totalRows - 1) * ROW_GAP;
}

export function getCarLayoutPoint(dayIndex: number, versionIndex: number, versionCount: number) {
  const rowWidth = ROAD_RIGHT - ROAD_LEFT;
  const laneCapacity = Math.max(1, Math.floor(rowWidth / CAR_SAFE_WIDTH));
  const laneCount = versionCount > 1
    ? Math.min(CAR_MAX_LANES, Math.max(2, Math.ceil(versionCount / laneCapacity)))
    : 1;
  const laneIndex = (versionIndex + dayIndex) % laneCount;
  const slotIndex = Math.floor(versionIndex / laneCount);
  const laneItemCount = Math.ceil((versionCount - laneIndex) / laneCount);
  const progress = (slotIndex + 1) / (laneItemCount + 1) + CAR_ROW_STAGGER[laneIndex % CAR_ROW_STAGGER.length];
  const centeredLane = laneIndex - (laneCount - 1) / 2;

  return {
    x: ROAD_LEFT + rowWidth * progress,
    y: getRowY(dayIndex) + centeredLane * CAR_LANE_SPACING,
  };
}

function getCarPosition(dayIndex: number, versionIndex: number, versionCount: number, totalRows: number) {
  const isLeftToRight = dayIndex % 2 === 0;
  const point = getCarLayoutPoint(dayIndex, versionIndex, versionCount);
  const x = isLeftToRight
    ? point.x
    : ROAD_RIGHT - (point.x - ROAD_LEFT);

  return {
    left: `${x / VIEWBOX_WIDTH * 100}%`,
    top: `${point.y / getCanvasHeight(totalRows) * 100}%`,
  };
}

function RoadSnakeCanvas({ days }: RoadSnakeCanvasProps) {
  const canvasHeight = getCanvasHeight(days.length);
  const snakePath = buildSnakePath(days);

  return (
    <section className="snake-road-canvas" aria-label="版本态势图">
      <svg className="snake-road-svg" viewBox={`0 0 ${VIEWBOX_WIDTH} ${canvasHeight}`} preserveAspectRatio="xMidYMin meet" aria-hidden="true">
        <defs>
          <filter id="snake-road-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="16" stdDeviation="12" floodColor="rgba(0,0,0,0.34)" />
          </filter>
          <linearGradient id="snake-road-asphalt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--snake-road-top)" />
            <stop offset="100%" stopColor="var(--snake-road-bottom)" />
          </linearGradient>
        </defs>
        <path className="snake-road-shoulder" d={snakePath} filter="url(#snake-road-shadow)" />
        <path className="snake-road-main" d={snakePath} />
        <path className="snake-road-edge snake-road-edge-top" d={snakePath} />
        <path className="snake-road-highlight" d={snakePath} />
        <path className="snake-road-centerline" d={snakePath} />
      </svg>

      {days.map((day, dayIndex) => (
        <div className={getDateMarkerClassName(dayIndex)} style={getDateLabelPosition(dayIndex, days.length)} key={day.dateKey}>
          <strong>{shortDateLabel(day.dateKey)}</strong>
          <span>
            <b>{weekdayLabel(day.dateKey)}</b>
            <em>{day.versions.length} 版本</em>
          </span>
        </div>
      ))}

      {days.map((day, dayIndex) => (
        day.versions.map((version: VersionDetail, versionIndex) => (
          <div
            className="snake-car-anchor"
            style={getCarPosition(dayIndex, versionIndex, day.versions.length, days.length)}
            key={version.patchId}
          >
            <RoadCar version={version} />
          </div>
        ))
      ))}
    </section>
  );
}

export default RoadSnakeCanvas;
