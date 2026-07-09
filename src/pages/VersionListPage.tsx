import { useMemo, useState } from 'react';
import VersionOverviewPanel from '../components/VersionOverviewPanel';
import VersionRowCard from '../components/VersionRowCard';
import { useCollectionVersions } from '../services/tedSbrain/useTedSbrainVersions';
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

  const { status: loadStatus, versions, error } = useCollectionVersions();
  const statusOptions = useMemo(() => getStatusOptions(versions), [versions]);
  const filteredVersions = useMemo(
    () => filterAndSortVersions(versions, { query, risk, status, sort }),
    [versions, query, risk, status, sort],
  );
  const filteredRiskCounts = useMemo(() => summarizeRiskCounts(filteredVersions), [filteredVersions]);

  if (loadStatus === 'loading') {
    return (
      <main className="page-shell list-page">
        <section className="list-empty" aria-live="polite">
          <h1>版本数据加载中</h1>
          <p>正在从 ted-sbrain 服务获取最新评分数据。</p>
        </section>
      </main>
    );
  }

  if (loadStatus === 'error') {
    return (
      <main className="page-shell list-page">
        <section className="list-empty" aria-live="polite">
          <h1>版本数据加载失败</h1>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell list-page">
      <VersionOverviewPanel
        title="版本列表"
        subtitle="统一查看版本列表与版本轨迹，风险数量会随搜索、状态与排序条件同步更新。"
        summaryItems={[
          { label: '当前在测', value: versions.length },
          { label: '筛选结果', value: filteredVersions.length },
          { label: '高风险', value: filteredRiskCounts.HIGH },
          { label: '中风险', value: filteredRiskCounts.MEDIUM },
          { label: '低风险', value: filteredRiskCounts.LOW },
          { label: '未知风险', value: filteredRiskCounts.UNKNOWN },
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
        backLabel="返回首页"
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
