import { formatScore, riskLabel, VersionDetail } from '../data/versionMock';

interface ScoreHeroProps {
  version: VersionDetail;
}

function ScoreHero({ version }: ScoreHeroProps) {
  return (
    <section className="score-hero score-strip" aria-label="版本综合评分">
      <span className="score-strip-label">VERSION SCORE</span>
      <div className="score-strip-value">{formatScore(version.totalScore)}</div>
      <span className={`risk-badge risk-${version.riskLevel.toLowerCase()}`}>{riskLabel(version.riskLevel)}</span>
      <div className="score-strip-metrics">
        <span>质量 {version.qualityScore.toFixed(2)}</span>
        <span>行为 {version.behaviorScore.toFixed(2)}</span>
      </div>
    </section>
  );
}

export default ScoreHero;
