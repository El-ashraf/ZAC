'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu, X, ShieldAlert, User, LogIn, LogOut,
  LayoutDashboard, Database, RefreshCw, ChevronLeft, ChevronRight, Globe, Sun, Moon, BookOpen, MessageSquare, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PUBLIC_LINKS = [
  { href: '/about',     label: 'About',     icon: Globe },
  { href: '/campaigns', label: 'Campaigns', icon: Compass },
  { href: '/blog',      label: 'Blog',      icon: BookOpen },
  { href: '/contact',   label: 'Contact',   icon: MessageSquare },
];

const INTERNAL_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/animals',   label: 'Database', icon: Database },
  { href: '/inaturalist', label: 'iNaturalist Sync', icon: RefreshCw },
  { href: '/profile',   label: 'Profile', icon: User },
];

interface NavbarProps {
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  isSidebar?: boolean;
}

export default function Navbar({
  isCollapsed = false,
  setIsCollapsed = () => {},
  isSidebar = false,
}: NavbarProps) {
  const path = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<{ email: string; name?: string; avatar?: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = res.ok ? await res.json() : null;
      if (data && data.authenticated) {
        const userEmail = data.email;
        let fullName = '';
        if (data.firstName || data.lastName) {
          fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        } else {
          fullName = userEmail.split('@')[0];
        }

        const savedName = localStorage.getItem(`${userEmail}_profile_name`) || fullName;
        const savedAvatar = localStorage.getItem(`${userEmail}_avatar`) || data.avatar || '';

        setUser({ 
          email: userEmail, 
          name: savedName, 
          avatar: savedAvatar 
        });
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setMenuOpen(false);
      setIsOpen(false);
      window.dispatchEvent(new Event('auth-change'));
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('zac_theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  // Responsive layout listener, auth sync, and theme init
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    
    checkAuth();
    window.addEventListener('auth-change', checkAuth);

    const savedTheme = localStorage.getItem('zac_theme') || 'dark';
    setTheme(savedTheme as 'dark' | 'light');
    if (savedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, [theme]);

  // Close mobile menu on path changes
  useEffect(() => {
    setIsOpen(false);
    setMenuOpen(false);
  }, [path]);

  // Render Horizontal Navigation for Public/Landing Pages
  if (!isSidebar) {
    return (
      <nav className="navbar" style={{ position: 'relative' }}>
        {/* Brand logo container */}
        <Link href="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="nav-logo-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="Zoology Animal Club" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: isMobile ? '0.85rem' : '1rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.2px', textTransform: 'uppercase' }}>
            {isMobile ? 'Zoology Animal Club' : 'Zoology Animal Club'}
          </span>
        </Link>

        {/* Desktop Links (Hidden on Mobile) */}
        {!isMobile && (
          <>
            <div className="nav-links">
              {PUBLIC_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link ${path === href ? 'active' : ''}`}
                >
                  {label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/dashboard"
                  className={`nav-link ${path === '/dashboard' ? 'active' : ''}`}
                  style={{ color: 'var(--primary)', fontWeight: 700 }}
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.4rem',
                marginRight: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s',
              }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link 
                  href="/dashboard" 
                  className="btn"
                  style={{
                    padding: '0.45rem 1.2rem',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    borderRadius: '40px',
                    padding: '0.45rem 1.1rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    transition: 'background 0.2s',
                    outline: 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="btn" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 1.2rem',
                  fontSize: '0.85rem'
                }}
              >
                <LogIn size={14} />
                <span>Log In</span>
              </Link>
            )}
          </>
        )}

        {/* Mobile Hamburger Button */}
        {isMobile && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1100
            }}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}

        {/* Mobile Drawer Menu */}
        <AnimatePresence>
          {isMobile && isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: '68px',
                left: 0,
                right: 0,
                background: 'var(--bg-drawer)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                zIndex: 1000,
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}
            >
              {PUBLIC_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link ${path === href ? 'active' : ''}`}
                  style={{
                    fontSize: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    display: 'block',
                    textAlign: 'center',
                    background: path === href ? 'rgba(34,197,94,0.08)' : 'transparent'
                  }}
                >
                  {label}
                </Link>
              ))}

              {user && (
                <Link
                  href="/dashboard"
                  className={`nav-link ${path === '/dashboard' ? 'active' : ''}`}
                  style={{
                    fontSize: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    display: 'block',
                    textAlign: 'center',
                    background: path === '/dashboard' ? 'rgba(34,197,94,0.08)' : 'transparent',
                    color: 'var(--primary)',
                    fontWeight: 700
                  }}
                >
                  Dashboard
                </Link>
              )}

              {/* Theme Toggle in Mobile Drawer */}
              <button
                onClick={toggleTheme}
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  borderRadius: '40px',
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
              </button>

              {user ? (
                <button 
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    borderRadius: '40px',
                    marginTop: '0.5rem',
                    display: 'block',
                    width: '100%',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  Logout
                </button>
              ) : (
                <Link 
                  href="/login" 
                  className="btn"
                  style={{
                    textAlign: 'center',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    borderRadius: '40px',
                    marginTop: '0.5rem',
                    display: 'block',
                    background: 'transparent',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)'
                  }}
                >
                  Log In
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    );
  }

  // Helper to render sidebar items
  const renderSidebarLinks = () => {
    return (
      <>
        {INTERNAL_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              title={isCollapsed && !isMobile ? label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isCollapsed && !isMobile ? '0' : '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(34, 197, 94, 0.08)' : 'transparent',
                transition: 'all 0.2s ease',
                justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
                textDecoration: 'none',
                fontSize: '0.92rem',
                fontWeight: 500,
                overflow: 'hidden',
              }}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {(!isCollapsed || isMobile) && (
                <span style={{ whiteSpace: 'nowrap', transition: 'opacity 0.2s' }}>{label}</span>
              )}
            </Link>
          );
        })}

        {/* Theme Toggle inside Sidebar */}
        <button
          onClick={toggleTheme}
          className="sidebar-link"
          title={isCollapsed && !isMobile ? 'Toggle Light/Dark Theme' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isCollapsed && !isMobile ? '0' : '0.85rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            color: 'var(--text-secondary)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
            width: '100%',
            textAlign: 'left',
            fontSize: '0.92rem',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          {theme === 'dark' ? <Sun size={20} style={{ flexShrink: 0 }} /> : <Moon size={20} style={{ flexShrink: 0 }} />}
          {(!isCollapsed || isMobile) && <span style={{ whiteSpace: 'nowrap' }}>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>}
        </button>
      </>
    );
  };

  // Render Left-Hand Sidebar Navigation for Client Pages
  return (
    <>
      {/* MOBILE TOP HEADER */}
      {isMobile && (
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'var(--bg-navbar)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          zIndex: 999,
        }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/logo.png" alt="Zoology Animal Club" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontWeight: 700, fontSize: '0.82rem', fontFamily: 'var(--font-display)', color: 'var(--primary)', letterSpacing: '-0.2px', textTransform: 'uppercase' }}>Zoology Animal Club</span>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Toggle sidebar drawer"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>
      )}

      {/* DESKTOP SIDEBAR OR MOBILE DRAWER */}
      <AnimatePresence>
        {(!isMobile || isOpen) && (
          <>
            {/* Mobile overlay backdrop */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 1000,
                }}
              />
            )}

            {/* Sidebar element itself */}
            <motion.div
              initial={isMobile ? { x: -280 } : false}
              animate={isMobile ? { x: 0 } : { width: isCollapsed ? 80 : 260 }}
              exit={isMobile ? { x: -280 } : undefined}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: isMobile ? '280px' : undefined,
                background: 'var(--bg-drawer)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid var(--border)',
                zIndex: 1001,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem 1rem',
                boxShadow: isMobile ? '8px 0 30px rgba(0,0,0,0.5)' : 'none',
                overflow: 'hidden',
              }}
            >
              {/* BRAND HEADER */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed && !isMobile ? 'center' : 'space-between',
                  height: '40px',
                }}>
                  <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', overflow: 'hidden' }}>
                    <img src="/logo.png" alt="Zoology Animal Club" style={{ height: '28px', width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
                    {(!isCollapsed || isMobile) && (
                      <span style={{
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        fontFamily: 'var(--font-display)',
                        color: '#fff',
                        whiteSpace: 'nowrap',
                        letterSpacing: '-0.2px',
                        textTransform: 'uppercase',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        Zoology Animal Club
                      </span>
                    )}
                  </Link>

                  {/* Collapse button on desktop */}
                  {!isMobile && (
                    <button
                      onClick={() => setIsCollapsed(!isCollapsed)}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        borderRadius: '6px',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                  )}
                </div>

                {/* SEPARATOR */}
                <div style={{ height: '1px', background: 'var(--border)', opacity: 0.6 }} />

                {/* NAVIGATION LIST */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {renderSidebarLinks()}
                  
                  {/* Home Landing Page Link in Sidebar */}
                  <Link
                    href="/"
                    className="sidebar-link"
                    title={isCollapsed && !isMobile ? 'Visit Site Homepage' : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isCollapsed && !isMobile ? '0' : '0.85rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      color: 'var(--text-secondary)',
                      transition: 'all 0.2s ease',
                      justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
                      textDecoration: 'none',
                      fontSize: '0.92rem',
                      overflow: 'hidden',
                    }}
                  >
                    <Globe size={20} style={{ flexShrink: 0 }} />
                    {(!isCollapsed || isMobile) && <span style={{ whiteSpace: 'nowrap' }}>Site Homepage</span>}
                  </Link>
                </nav>
              </div>

              {/* USER PROFILE & LOGOUT SECTION DOCKED AT BOTTOM */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ height: '1px', background: 'var(--border)', opacity: 0.6 }} />

                {user ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* User display */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.35rem 0.5rem',
                      overflow: 'hidden',
                    }}>
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Avatar" 
                          style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%', 
                            objectFit: 'cover', 
                            border: '1px solid var(--primary)', 
                            flexShrink: 0 
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(34, 197, 94, 0.15)',
                          border: '1px solid var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--primary)',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          flexShrink: 0,
                        }}>
                          {(user.name || user.email).substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      {(!isCollapsed || isMobile) && (
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          <span style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#fff',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden'
                          }}>
                            {user.name || user.email.split('@')[0]}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden'
                          }}>
                            {user.email}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Admin portal shortcut (only visible if expanded) */}
                    {(!isCollapsed || isMobile) && (
                      <Link 
                        href="/admin" 
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border)',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          textDecoration: 'none',
                          justifyContent: 'center',
                        }}
                      >
                        <ShieldAlert size={14} style={{ color: 'var(--accent)' }} />
                        <span>Admin Portal</span>
                      </Link>
                    )}

                    {/* Logout action */}
                    <button
                      onClick={handleLogout}
                      title={isCollapsed && !isMobile ? 'Logout' : undefined}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
                        gap: '0.6rem',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        transition: 'background 0.2s',
                        outline: 'none',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                    >
                      <LogOut size={16} style={{ flexShrink: 0 }} />
                      {(!isCollapsed || isMobile) && <span>Log Out</span>}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    title={isCollapsed && !isMobile ? 'Log In' : undefined}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      background: 'var(--primary)',
                      color: '#0a0f0d',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
                      gap: '0.6rem',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      boxShadow: '0 0 10px var(--primary-glow)',
                    }}
                  >
                    <LogIn size={16} style={{ flexShrink: 0 }} />
                    {(!isCollapsed || isMobile) && <span>Log In</span>}
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
