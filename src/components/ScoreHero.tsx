import { Activity, ShieldCheck } from 'lucide-react';
import { formatScore, riskLabel, VersionDetail } from '../data/versionMock';

interface ScoreHeroProps {
  version: VersionDetail;
}

function ScoreHero({ version }: ScoreHeroProps) {
  return (
    <section className="score-hero" aria-label="版本综合评分">
      <div className="score-hero-main">
        <p className="eyebrow">VERSION SCORE</p>
        <div className="hero-score-wrap">
          <div className="hero-score">{formatScore(version.totalScore)}</div>
        </div>
        <div className="hero-risk-line">
          <span className={`risk-badge risk-${version.riskLevel.toLowerCase()}`}>{riskLabel(version.riskLevel)}</span>
          <span>质量 {version.qualityScore.toFixed(2)} / 行为 {version.behaviorScore.toFixed(2)}</span>
        </div>
      </div>
      <div className="hero-score-grid">
        <div className="score-module score-module-quality">
          <ShieldCheck size={18} aria-hidden="true" />
          <span>质量得分</span>
          <strong>{version.qualityScore.toFixed(2)}</strong>
        </div>
        <div className="score-module score-module-behavior">
          <Activity size={18} aria-hidden="true" />
          <span>行为得分</span>
          <strong>{version.behaviorScore.toFixed(2)}</strong>
        </div>
      </div>
    </section>
  );
}

export default ScoreHero;
