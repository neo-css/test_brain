import { Navigate, Route, Routes } from 'react-router-dom';
import L1DashboardPage from './pages/L1DashboardPage';
import VersionDetailPage from './pages/VersionDetailPage';
import VersionListPage from './pages/VersionListPage';
import VersionRoadPage from './pages/VersionRoadPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<L1DashboardPage />} />
      <Route path="/versions" element={<VersionListPage />} />
      <Route path="/versions/road" element={<VersionRoadPage />} />
      <Route path="/versions/:patchId" element={<VersionDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
