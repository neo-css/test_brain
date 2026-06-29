import { useMemo, useState } from 'react';
import VersionRowCard from '../components/VersionRowCard';
import { versionDetails } from '../data/versionMock';
import {
  filterAndSortVersions,
  getStatusOptions,
  RiskFilter,
  summarizeRiskCounts,
  VersionSort,
} from './versionListFilters';

function VersionListPage() {
  const [query, setQuery] = useState('');
  const [risk, setRisk] = useState<RiskFilter>('ALL');
  const [status, setStatus] = useState('ALL');
  const [sort, setSort] = useState<VersionSort>('RISK');

  const riskCounts = useMemo(() => summarizeRiskCounts(versionDetails), []);
  const statusOptions = useMemo(() => getStatusOptions(versionDetails), []);
  const filteredVersions = useMemo(
    () => filterAndSortVersions(versionDetails, { query, risk, status, sort }),
    [query, risk, status, sort],
  );

  return (
    <main className="page-shell list-page">
      <section className="list-header">
        <div>
          <p className="eyebrow">IN-TEST VERSIONS</p>
          <h1>在测版本态势列表</h1>
        </div>
        <div className="list-count">
          <span>当前在测</span>
          <strong>{versionDetails.length}</strong>
        </div>
      </section>

      <section className="list-summary" aria-label="风险概览">
        <div>
          <span>高风险</span>
          <strong>{riskCounts.HIGH}</strong>
        </div>
        <div>
          <span>中风险</span>
          <strong>{riskCounts.MEDIUM}</strong>
        </div>
        <div>
          <span>低风险</span>
          <strong>{riskCounts.LOW}</strong>
        </div>
        <div>
          <span>筛选结果</span>
          <strong>{filteredVersions.length}</strong>
        </div>
      </section>

      <section className="list-toolbar" aria-label="版本筛选和排序">
        <label className="search-field">
          <span>搜索</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="版本、系统、团队、负责人"
            aria-label="搜索在测版本"
          />
        </label>
        <label>
          <span>风险</span>
          <select value={risk} onChange={(event) => setRisk(event.target.value as RiskFilter)} aria-label="按风险筛选">
            <option value="ALL">全部风险</option>
            <option value="HIGH">高风险</option>
            <option value="MEDIUM">中风险</option>
            <option value="LOW">低风险</option>
          </select>
        </label>
        <label>
          <span>状态</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="按状态筛选">
            <option value="ALL">全部状态</option>
            {statusOptions.map((option) => (
              <option value={option} key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          <span>排序</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as VersionSort)} aria-label="版本排序">
            <option value="RISK">风险优先</option>
            <option value="SCORE_ASC">总分升序</option>
            <option value="SCORE_DESC">总分降序</option>
            <option value="LATEST">快照最新</option>
          </select>
        </label>
      </section>

      {filteredVersions.length > 0 ? (
        <ul className="version-list" aria-label="在测版本列表">
          {filteredVersions.map((version) => (
            <li key={version.patchId}>
              <VersionRowCard version={version} />
            </li>
          ))}
        </ul>
      ) : (
        <section className="list-empty" aria-live="polite">
          <h2>没有匹配的在测版本</h2>
          <p>调整搜索关键词、风险等级或状态筛选后再试。</p>
        </section>
      )}
    </main>
  );
}

export default VersionListPage;
