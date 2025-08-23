'use client';

import Header from './Header';
import Footer from './Footer';
import { useAuth } from '@/context/AuthContext';

const Layout = ({ children, showHeader = true, showFooter = true }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && user && <Header />}
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
