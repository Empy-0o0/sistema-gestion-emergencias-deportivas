'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  
  const { login, error, user, clearError } = useAuth();
  const router = useRouter();

  // Redirigir si ya está logueado
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Limpiar error cuando cambie el formulario
  useEffect(() => {
    if (error && showError) {
      clearError();
      setShowError(false);
    }
  }, [formData, error, showError, clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setShowError(true);
      return;
    }

    setIsLoading(true);
    
    try {
      await login(formData.username, formData.password);
      router.push('/');
    } catch (error) {
      setShowError(true);
      console.error('Error en login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoCredentials = () => {
    return [
      { role: 'Administrador', username: 'admin', password: 'admin123' },
      { role: 'Brigada de Emergencia', username: 'brigada', password: 'brigada123' },
      { role: 'Enfermería', username: 'enfermeria', password: 'enfermeria123' },
      { role: 'Liga Deportiva', username: 'liga', password: 'liga123' }
    ];
  };

  const fillDemoCredentials = (username, password) => {
    setFormData({ username, password });
  };

  if (user) {
    return (
      <Layout showHeader={false} showFooter={false}>
        <div className="login-container">
          <div className="text-center">
            <div className="loading mb-4"></div>
            <p>Redirigiendo...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={false} showFooter={false}>
      <div className="login-container">
        <div className="login-card">
          {/* Logo y título */}
          <div className="login-header">
            <div className="logo-icon mx-auto mb-4">ES</div>
            <h1 className="login-title">ErgoSaniTas</h1>
            <p className="login-subtitle">Sistema de Gestión de Emergencias Deportivas</p>
          </div>

          {/* Formulario de login */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-control"
                placeholder="Ingrese su usuario"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                placeholder="Ingrese su contraseña"
                required
                disabled={isLoading}
              />
            </div>

            {(error && showError) && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading mr-2"></span>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Credenciales de demostración */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Credenciales de Demostración:</h3>
            <div className="space-y-2">
              {getDemoCredentials().map((cred, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-600">{cred.role}:</span>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials(cred.username, cred.password)}
                    className="text-blue-600 hover:text-blue-800 underline"
                    disabled={isLoading}
                  >
                    {cred.username} / {cred.password}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Haga clic en las credenciales para llenar automáticamente el formulario
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
