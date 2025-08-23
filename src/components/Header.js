'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getNavigationLinks = () => {
    if (!user) return [];

    const baseLinks = [
      { href: '/', label: 'Dashboard', roles: ['admin', 'brigada', 'enfermeria', 'liga'] }
    ];

    const roleLinks = [
      { href: '/brigada', label: 'Panel Brigada', roles: ['admin', 'brigada'] },
      { href: '/enfermeria', label: 'Panel Enfermería', roles: ['admin', 'enfermeria'] },
      { href: '/liga', label: 'Panel Liga', roles: ['admin', 'liga'] },
      { href: '/admin', label: 'Administración', roles: ['admin'] }
    ];

    return [...baseLinks, ...roleLinks].filter(link => 
      link.roles.includes(user.role)
    );
  };

  if (!user) return null;

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-icon">ES</div>
          <div>
            <h1>Ergo<span className="brand-accent">SaniTas</span></h1>
            <p className="header-subtitle">Sistema Integral de Gestión Médica Deportiva</p>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          {getNavigationLinks().map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="user-info">
          <div className="avatar">
            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold">{user.name}</div>
            <small className="text-gray-600 capitalize">{user.role}</small>
          </div>
          <button
            onClick={handleLogout}
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="system-status">
          <div className="status-indicator"></div>
          <span>Sistema Operativo</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
