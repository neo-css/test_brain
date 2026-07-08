import { useMemo, useState } from 'react';
import RoadSnakeCanvas from '../components/RoadSnakeCanvas';
import VersionOverviewPanel from '../components/VersionOverviewPanel';
import { versionDetails } from '../data/versionMock';
import {
  filterAndSortVersions,
  getStatusOptions,
  RiskFilter,
  summarizeRiskCounts,
  VersionSort,
} from './versionListFilters';
import {
  buildDayWindow,
  buildRangeWindow,
  getDataAnchorDate,
  groupByDay,
  shiftDays,
} from './versionRoadGrouping';

type RangeMode = 'QUICK' | 'CUSTOM';
const QUICK_DAYS = [3, 7, 10, 30] as const;
type QuickDays = (typeof QUICK_DAYS)[number];

function VersionRoadPage() {
  const anchor = useMemo(() => getDataAnchorDate(versionDetails), []);
  const [rangeMode, setRangeMode] = useState<RangeMode>('QUICK');
  const [quickDays, setQuickDays] = useState<QuickDays>(10);
  const [fromDate, setFromDate] = useState<string>(anchor);
  const [toDate, setToDate] = useState<string>(shiftDays(anchor, 9));
  const [query, setQuery] = useState('');
  const [risk, setRisk] = useState<RiskFilter>('ALL');
  const [status, setStatus] = useState('ALL');
  const [sort, setSort] = useState<VersionSort>('RISK');

  const window = useMemo(() => {
    if (rangeMode === 'QUICK') {
      return buildDayWindow(anchor, quickDays);
    }
    return buildRangeWindow(fromDate, toDate);
  }, [rangeMode, quickDays, fromDate, toDate, anchor]);

  const filteredVersions = useMemo(
    () => filterAndSortVersions(versionDetails, { query, risk, status, sort }),
    [query, risk, status, sort],
  );

  const dayRows = useMemo(() => groupByDay(filteredVersions, window), [filteredVersions, window]);

  const versionsInWindowCount = useMemo(
    () => dayRows.reduce((sum, day) => sum + day.versions.length, 0),
    [dayRows],
  );

  const riskCounts = useMemo(() => {
    const inWindow = dayRows.flatMap((day) => day.versions);
    return summarizeRiskCounts(inWindow);
  }, [dayRows]);

  const statusOptions = useMemo(() => getStatusOptions(versionDetails), []);

  return (
    <main className="page-shell road-page">
      <VersionOverviewPanel
        title="版本态势"
        subtitle={`数据锚点 ${anchor}，可在版本列表与版本态势之间切换，当前态势按发版日期展开。`}
        summaryItems={[
          { label: '当前在测', value: versionDetails.length },
          { label: '筛选结果', value: filteredVersions.length },
          { label: '高风险', value: riskCounts.HIGH },
          { label: '中风险', value: riskCounts.MEDIUM },
          { label: '低风险', value: riskCounts.LOW },
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
      >
        <section className="road-range" aria-label="时间范围">
          <div className="road-range-quick" role="tablist" aria-label="时间快捷选项">
            <button
              type="button"
              role="tab"
              aria-selected={rangeMode === 'QUICK'}
              className={rangeMode === 'QUICK' ? 'active' : ''}
              onClick={() => setRangeMode('QUICK')}
            >
              近期
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={rangeMode === 'CUSTOM'}
              className={rangeMode === 'CUSTOM' ? 'active' : ''}
              onClick={() => setRangeMode('CUSTOM')}
            >
              自定义
            </button>
          </div>
          {rangeMode === 'QUICK' ? (
            <div className="road-range-options">
              {QUICK_DAYS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`road-range-pill ${quickDays === option ? 'active' : ''}`}
                  onClick={() => setQuickDays(option)}
                >
                  近 {option} 天
                </button>
              ))}
            </div>
          ) : (
            <div className="road-range-custom">
              <label>
                <span>起始</span>
                <input
                  type="date"
                  value={fromDate}
                  max={toDate}
                  onChange={(event) => setFromDate(event.target.value)}
                />
              </label>
              <span className="road-range-sep" aria-hidden="true">→</span>
              <label>
                <span>截止</span>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  onChange={(event) => setToDate(event.target.value)}
                />
              </label>
            </div>
          )}
          <div className="road-range-info">
            展示未来 {window.length} 天 · {window[0]} 至 {window[window.length - 1]}
          </div>
        </section>

        <section className="road-legend" aria-label="破损等级图例">
          <h3>图例</h3>
          <ul>
            <li><span className="legend-dot damage-0" />≥ 85 完好</li>
            <li><span className="legend-dot damage-1" />75–85 轻微</li>
            <li><span className="legend-dot damage-2" />65–75 中度</li>
            <li><span className="legend-dot damage-3" />55–65 严重</li>
            <li><span className="legend-dot damage-4" />&lt; 55 抛锚</li>
          </ul>
        </section>
      </VersionOverviewPanel>

      {versionsInWindowCount === 0 ? (
        <section className="list-empty road-empty" aria-live="polite">
          <h2>赛道空荡荡</h2>
          <p>当前筛选与时间范围内没有版本，请调整搜索或时间窗口。</p>
        </section>
      ) : (
        <RoadSnakeCanvas days={dayRows} />
      )}
    </main>
  );
}

export default VersionRoadPage;
