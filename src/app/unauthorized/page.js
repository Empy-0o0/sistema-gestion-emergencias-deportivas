'use client';

import Link from 'next/link';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <Layout showHeader={false} showFooter={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl text-red-500 mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Acceso No Autorizado
            </h1>
            <p className="text-gray-600">
              No tienes permisos para acceder a esta página.
            </p>
          </div>

          {user && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Usuario actual:</strong> {user.name}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Rol:</strong> {user.role}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir al Dashboard
            </Link>
            
            <Link
              href="/login"
              className="block w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cambiar de Usuario
            </Link>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>Si crees que esto es un error, contacta al administrador del sistema.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
