import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';
import VersionViewModeSwitch from './VersionViewModeSwitch';
import { RiskFilter, VersionSort } from '../pages/versionListFilters';

interface SummaryItem {
  label: string;
  value: number | string;
}

interface VersionOverviewPanelProps {
  title: string;
  subtitle: string;
  summaryItems: SummaryItem[];
  query: string;
  risk: RiskFilter;
  status: string;
  sort: VersionSort;
  statusOptions: string[];
  onQueryChange: (value: string) => void;
  onRiskChange: (value: RiskFilter) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: VersionSort) => void;
  showBackLink?: boolean;
  backLabel?: string;
  children?: ReactNode;
}

function VersionOverviewPanel({
  title,
  subtitle,
  summaryItems,
  query,
  risk,
  status,
  sort,
  statusOptions,
  onQueryChange,
  onRiskChange,
  onStatusChange,
  onSortChange,
  showBackLink = false,
  backLabel = '返回首页',
  children,
}: VersionOverviewPanelProps) {
  return (
    <>
      <section className="list-header version-overview-header">
        <div>
          <p className="eyebrow">IN-TEST VERSIONS</p>
          <h1>{title}</h1>
          <p className="version-overview-subtitle">{subtitle}</p>
        </div>
        <div className="list-header-actions">
          <ThemeSwitcher />
          <VersionViewModeSwitch />
          {showBackLink && (
            <Link className="back-link" to="/">
              <ArrowLeft size={14} aria-hidden="true" />
              {backLabel}
            </Link>
          )}
        </div>
      </section>

      <section className="version-overview-panel" aria-label="版本概览与筛选">
        <section className="list-summary version-summary" aria-label="版本数量概览">
          {summaryItems.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </section>

        <section className="list-toolbar version-filter-toolbar" aria-label="版本筛选和排序">
          <label className="search-field">
            <span>搜索</span>
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="版本、系统、团队、负责人"
              aria-label="搜索在测版本"
            />
          </label>
          <label>
            <span>风险</span>
            <select value={risk} onChange={(event) => onRiskChange(event.target.value as RiskFilter)} aria-label="按风险筛选">
              <option value="ALL">全部风险</option>
              <option value="HIGH">高风险</option>
              <option value="MEDIUM">中风险</option>
              <option value="LOW">低风险</option>
              <option value="UNKNOWN">未知风险</option>
            </select>
          </label>
          <label>
            <span>状态</span>
            <select value={status} onChange={(event) => onStatusChange(event.target.value)} aria-label="按状态筛选">
              <option value="ALL">全部状态</option>
              {statusOptions.map((option) => (
                <option value={option} key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            <span>排序</span>
            <select value={sort} onChange={(event) => onSortChange(event.target.value as VersionSort)} aria-label="版本排序">
              <option value="RISK">风险优先</option>
              <option value="SCORE_ASC">总分升序</option>
              <option value="SCORE_DESC">总分降序</option>
              <option value="LATEST">快照最新</option>
            </select>
          </label>
        </section>

        {children}
      </section>
    </>
  );
}

export default VersionOverviewPanel;
