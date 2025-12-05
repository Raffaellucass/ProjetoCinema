import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import { Suspense, lazy } from 'react';

const AuthPage = lazy(() => import('./components/AuthPage'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const Dashboard = lazy(() => import('./components/Dashboard'));

// Componente de redirecionamento da raiz
function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? '/' : '/login'} replace />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="loading-spinner w-12 h-12"></div>
          </div>
        }>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Rotas protegidas */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* Fallback - redireciona para home ou login */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
