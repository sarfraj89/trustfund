import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    requireRegistration?: boolean;
}

export const ProtectedRoute = ({ children, requireRegistration = true }: ProtectedRouteProps) => {
    const { isWalletConnected, isRegistered, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
            </div>
        );
    }

    if (!isWalletConnected) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (requireRegistration && !isRegistered) {
        return <Navigate to="/register" state={{ from: location }} replace />;
    }

    if (!requireRegistration && isRegistered && location.pathname === '/register') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};
