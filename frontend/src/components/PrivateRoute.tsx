import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
    children: React.ReactNode;
    requiredRole?: 'user' | 'admin';
}

export default function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md p-8">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
                    <p className="text-gray-600">
                        Você não tem permissão para acessar esta página.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
