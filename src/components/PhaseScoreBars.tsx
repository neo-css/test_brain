import { CSSProperties } from 'react';
import { MetricGroup } from '../data/versionMock';

interface PhaseScoreBarsProps {
  groups: MetricGroup[];
}

function PhaseScoreBars({ groups }: PhaseScoreBarsProps) {
  const maxScore = Math.max(...groups.map((group) => group.groupScore), 1);

  return (
    <div className="phase-bars">
      {groups.map((group) => (
        <div className="phase-bar-row" key={group.key}>
          <div className="phase-bar-head">
            <span>{group.displayName}</span>
            <strong>{group.groupScore.toFixed(2)}</strong>
          </div>
          <div
            className="phase-bar-track"
            role="meter"
            aria-label={`${group.displayName}得分`}
            aria-valuemin={0}
            aria-valuemax={maxScore}
            aria-valuenow={group.groupScore}
          >
            <div
              className="phase-bar-fill"
              style={{ '--target-width': `${(group.groupScore / maxScore) * 100}%` } as CSSProperties}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default PhaseScoreBars;
