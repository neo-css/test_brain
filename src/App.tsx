import { Navigate, Route, Routes } from 'react-router-dom';
import VersionDetailPage from './pages/VersionDetailPage';
import VersionListPage from './pages/VersionListPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<VersionListPage />} />
      <Route path="/versions/:patchId" element={<VersionDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
