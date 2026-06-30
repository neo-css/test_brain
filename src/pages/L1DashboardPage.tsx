import { useState } from 'react';
import { Link } from 'react-router-dom';
import DynamicTopology from '../components/DynamicTopology';
import { versionDetails } from '../data/versionMock';

function Panel({
  title,
  to,
  state,
  children,
}: {
  title: string;
  to: string;
  state?: unknown;
  children: React.ReactNode;
}) {
  return (
    <Link className="l1-panel" to={to} state={state}>
      <span className="l1-panel-title">{title}</span>
      {children}
    </Link>
  );
}

function EnvironmentBars() {
  const rows = [
    ['虚机', 10000],
    ['容器', 2000],
    ['DBaaS', 7000],
  ] as const;

  return (
    <div className="l1-chart l1-bar-chart">
      {rows.map(([label, value]) => (
        <div className="l1-bar-item" key={label}>
          <strong>{value}</strong>
          <i style={{ height: `${value / 115}px` }} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function L2Bars() {
  const rows = [
    ['紫金', 4.2],
    ['清算', 4.4],
    ['云闪付', 4.3],
    ['二维', 4.1],
    ['云闪付', 3.9],
    ['差错', 4.5],
    ['商户', 3.8],
  ] as const;

  return (
    <div className="l1-chart l1-l2-bars">
      {rows.map(([label, value]) => (
        <div className="l1-l2-item" key={`${label}-${value}`}>
          <strong>{value.toFixed(1)}</strong>
          <i style={{ height: `${value * 20}px` }} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function HardwareBars() {
  const rows = [
    ['DISK(G)', 7000, 6000],
    ['MEM(G)', 12000, 8500],
    ['CPU(C)', 10000, 9000],
  ] as const;

  return (
    <div className="l1-chart l1-hardware-bars">
      <div className="l1-legend"><span><i className="orange" />总量</span><span><i />已用</span></div>
      {rows.map(([label, total, used]) => (
        <div className="l1-hardware-row" key={label}>
          <span>{label}</span>
          <div>
            <b className="orange" style={{ width: `${total / 120}%` }} />
            <b style={{ width: `${used / 120}%` }} />
          </div>
          <em>{total}<br />{used}</em>
        </div>
      ))}
    </div>
  );
}

function Radar() {
  const points = '120,48 178,84 166,150 120,178 72,150 62,84';
  return (
    <div className="l1-chart l1-radar">
      <svg viewBox="0 0 240 220" aria-hidden="true">
        {[36, 58, 80].map((r) => (
          <polygon
            key={r}
            points={`${120},${110 - r} ${120 + r * 0.86},${110 - r * 0.5} ${120 + r * 0.86},${110 + r * 0.5} ${120},${110 + r} ${120 - r * 0.86},${110 + r * 0.5} ${120 - r * 0.86},${110 - r * 0.5}`}
          />
        ))}
        <polygon className="radar-fill" points={points} />
      </svg>
    </div>
  );
}

function CoverageStats() {
  return (
    <div className="l1-coverage">
      <p><span>系统覆盖率</span><strong>98.48%</strong></p>
      <p><span>执行成功率</span><strong>95.23%</strong></p>
      <p><span>接口覆盖率</span><strong>92.86%</strong></p>
    </div>
  );
}

function Topology({
  selectedPatchId,
  onSelectVersion,
}: {
  selectedPatchId: number | null;
  onSelectVersion: (patchId: number | null) => void;
}) {
  return (
    <section className="l1-topology-card">
      <div className="l1-health">质量健康指数：<strong>3.9</strong></div>
      <DynamicTopology versions={versionDetails} selectedPatchId={selectedPatchId} onSelectVersion={onSelectVersion} />
    </section>
  );
}

function TaskPie() {
  return (
    <Panel title="大脑任务" to="/versions">
      <div className="l1-task">
        <div className="l1-pie"><span>20</span><em>10</em></div>
        <div><p><i />已处理</p><p><i className="orange" />未处理</p></div>
      </div>
    </Panel>
  );
}

function L1DashboardPage() {
  const firstVersion = versionDetails[0];
  const [selectedPatchId, setSelectedPatchId] = useState<number | null>(null);
  const versionTrendTo = selectedPatchId ? `/versions/${selectedPatchId}` : '/versions';
  const fromHomeState = { from: '/', fromLabel: '返回测试大脑' };

  return (
    <main className="l1-page">
      <header className="l1-header">
        <Link to="/versions" state={fromHomeState}>20260608</Link>
        <h1>测试大脑</h1>
        <Link to="/versions" state={fromHomeState}>星期一</Link>
      </header>

      <section className="l1-grid">
        <aside className="l1-stack">
          <Panel title="环境资源" to="/versions" state={fromHomeState}><EnvironmentBars /></Panel>
          <Panel title="L2态势" to="/versions" state={fromHomeState}><L2Bars /></Panel>
          <Panel title="390回归覆盖率" to={`/versions/${firstVersion.patchId}`} state={fromHomeState}><CoverageStats /></Panel>
        </aside>

        <div className="l1-center">
          <Topology selectedPatchId={selectedPatchId} onSelectVersion={setSelectedPatchId} />
          <TaskPie />
        </div>

        <aside className="l1-stack">
          <Panel title="硬件态势" to="/versions" state={fromHomeState}><HardwareBars /></Panel>
          <Panel title="版本态势" to={versionTrendTo} state={fromHomeState}><Radar /></Panel>
          <Panel title="变更覆盖率" to={`/versions/${firstVersion.patchId}`} state={fromHomeState}>
            <div className="l1-change">
              <p><span>Java</span><strong>90.28%</strong></p>
              <p><span>C/C++</span><strong>83.18%</strong></p>
            </div>
          </Panel>
        </aside>
      </section>
    </main>
  );
}

export default L1DashboardPage;
