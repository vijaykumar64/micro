import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Files } from './pages/Files';
import { Properties } from './pages/Properties';
import { Verifications } from './pages/Verifications';
import { WorkItems } from './pages/WorkItems';
import { Notifications } from './pages/Notifications';
import { Audit } from './pages/Audit';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout><Navigate to="/dashboard" /></Layout>} path="/" />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            <Route path="/files" element={<Layout><Files /></Layout>} />
            <Route path="/properties" element={<Layout><Properties /></Layout>} />
            <Route path="/verifications" element={<Layout><Verifications /></Layout>} />
            <Route path="/work-items" element={<Layout><WorkItems /></Layout>} />
            <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
            <Route path="/audit" element={<Layout><Audit /></Layout>} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
