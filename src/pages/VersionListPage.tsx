import { useMemo, useState } from 'react';
import VersionOverviewPanel from '../components/VersionOverviewPanel';
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

  const statusOptions = useMemo(() => getStatusOptions(versionDetails), []);
  const filteredVersions = useMemo(
    () => filterAndSortVersions(versionDetails, { query, risk, status, sort }),
    [query, risk, status, sort],
  );
  const filteredRiskCounts = useMemo(() => summarizeRiskCounts(filteredVersions), [filteredVersions]);

  return (
    <main className="page-shell list-page">
      <VersionOverviewPanel
        title="版本列表"
        subtitle="统一查看版本列表与版本态势，风险数量会随搜索、状态与排序条件同步更新。"
        summaryItems={[
          { label: '当前在测', value: versionDetails.length },
          { label: '筛选结果', value: filteredVersions.length },
          { label: '高风险', value: filteredRiskCounts.HIGH },
          { label: '中风险', value: filteredRiskCounts.MEDIUM },
          { label: '低风险', value: filteredRiskCounts.LOW },
        ]}
        query={query}
        risk={risk}
        status={status}
        sort={sort}
        statusOptions={statusOptions}
        onQueryChange={setQuery}
        onRiskChange={setRisk}
        onStatusChange={setStatus}
        onSortChange={setSort}
        showBackLink
        backLabel="返回 L1"
      />

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
