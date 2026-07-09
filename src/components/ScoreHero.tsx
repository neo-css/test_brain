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
      <div className="score-strip-owners" aria-label="版本负责人信息">
        <span>版本负责人 <strong>{version.patchOwner}</strong></span>
        <span>测试负责人 <strong>{version.testLeader}</strong></span>
        <span>开发负责人 <strong>{version.devLeader}</strong></span>
      </div>
    </section>
  );
}

export default ScoreHero;
