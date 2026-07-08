import { List, Route } from 'lucide-react';
import { NavLink } from 'react-router-dom';

function VersionViewModeSwitch() {
  return (
    <nav className="version-view-switch" aria-label="版本视图切换">
      <NavLink
        to="/versions"
        end
        className={({ isActive }) => `version-view-option ${isActive ? 'active' : ''}`}
      >
        <List size={14} aria-hidden="true" />
        <span>版本列表</span>
      </NavLink>
      <NavLink
        to="/versions/road"
        className={({ isActive }) => `version-view-option ${isActive ? 'active' : ''}`}
      >
        <Route size={14} aria-hidden="true" />
        <span>版本态势</span>
      </NavLink>
    </nav>
  );
}

export default VersionViewModeSwitch;
