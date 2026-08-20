'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load initial collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('zac_sidebar_collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const handleCollapseToggle = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    localStorage.setItem('zac_sidebar_collapsed', String(collapsed));
  };

  const isLoginPage = pathname === '/login';
  const isPublicPage = 
    pathname === '/' || 
    pathname === '/about' || 
    pathname === '/campaigns' || 
    pathname.startsWith('/blog') || 
    pathname === '/contact';
  const isClientPage = !isLoginPage && !isPublicPage;

  if (isLoginPage) {
    return <main style={{ width: '100%', minHeight: '100vh' }}>{children}</main>;
  }

  return (
    <>
      <Navbar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={handleCollapseToggle} 
        isSidebar={isClientPage} 
      />
      <div 
        className={isClientPage ? `client-content-container ${isCollapsed ? 'collapsed' : ''}` : ''}
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        <main style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
