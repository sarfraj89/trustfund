import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppWalletProvider } from './components/AppWalletProvider';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { RoleBanner } from './components/RoleBanner';
import { LandingPage } from './pages/LandingPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { ClientDashboard } from './pages/ClientDashboard';
import { FreelancerDashboard } from './pages/FreelancerDashboard';
import { useAuth } from './context/AuthContext';

import './index.css';

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen bg-bg text-text">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <Topbar />
      <RoleBanner />
      <main className="flex-1 overflow-y-auto p-8 text-text">
        {children}
      </main>
    </div>
  </div>
);

const DashboardRouter = () => {
  const { currentUser } = useAuth();

  if (currentUser?.role === 'client') {
    return <ClientDashboard />;
  }

  if (currentUser?.role === 'freelancer') {
    return <FreelancerDashboard />;
  }

  return <Navigate to="/" replace />;
};

function App() {
  return (
    <AppWalletProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/register"
              element={
                <ProtectedRoute requireRegistration={false}>
                  <RegistrationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DashboardRouter />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </AppWalletProvider>
  )
}

export default App;
