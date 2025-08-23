'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Verificar roles si se especifican
    if (requiredRole && user.role !== requiredRole) {
      router.push('/unauthorized');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push('/unauthorized');
      return;
    }

    setIsAuthorized(true);
  }, [user, loading, isAuthenticated, requiredRole, allowedRoles, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Mostrar loading mientras se verifica la autorización
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
