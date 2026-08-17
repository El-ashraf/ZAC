'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, X, ShieldAlert, User, LogIn, LogOut, ChevronDown,
  LayoutDashboard, Database, RefreshCw, ChevronLeft, ChevronRight, Home, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LINKS = [
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

  // Responsive layout listener and auth sync
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

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

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
            <span className="nav-brand-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌿</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
            {isMobile ? 'ZAC' : 'Zoology Animal Club'}
          </span>
        </Link>

        {/* Desktop Links (Hidden on Mobile) */}
        {!isMobile && (
          <>
            <div className="nav-links">
              {LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link ${path === href ? 'active' : ''}`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {user ? (
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border)',
                    color: '#fff',
                    borderRadius: '40px',
                    padding: '0.4rem 1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={() => setMenuOpen(true)}
                >
                  <User size={15} style={{ color: 'var(--primary)' }} />
                  <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email.split('@')[0]}
                  </span>
                  <ChevronDown size={12} style={{ transition: 'transform 0.2s', transform: menuOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onMouseLeave={() => setMenuOpen(false)}
                      style={{
                        position: 'absolute',
                        top: '40px',
                        right: 0,
                        background: 'rgba(10, 15, 13, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '0.5rem',
                        minWidth: '160px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                        zIndex: 1050,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem'
                      }}
                    >
                      <Link href="/profile" className="nav-link" style={{ fontSize: '0.82rem', padding: '0.5rem' }}>
                        My Profile
                      </Link>
                      <Link href="/admin" className="nav-link" style={{ fontSize: '0.82rem', padding: '0.5rem' }}>
                        Admin Portal
                      </Link>
                      <div style={{ height: '1px', background: 'var(--border)', margin: '0.25rem 0' }} />
                      <button 
                        onClick={handleLogout}
                        style={{
                          background: 'none',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          fontSize: '0.82rem',
                          color: '#f87171',
                          width: '100%',
                          textAlign: 'left',
                          cursor: 'pointer',
                          borderRadius: '6px'
                        }}
                        className="nav-link"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                background: 'rgba(10, 15, 13, 0.95)',
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
              {user && (
                <div style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <User size={14} style={{ color: 'var(--primary)' }} />
                  <span>Logged in: <strong>{user.email}</strong></span>
                </div>
              )}

              {LINKS.map(({ href, label }) => (
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

              <Link 
                href="/admin" 
                className="btn"
                style={{
                  textAlign: 'center',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  borderRadius: '40px',
                  marginTop: '0.5rem',
                  display: 'block'
                }}
              >
                Admin Portal
              </Link>

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
    return LINKS.map(({ href, label, icon: Icon }) => {
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
    });
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
          background: 'rgba(10, 15, 13, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          zIndex: 999,
        }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🌿</span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-display)', color: 'var(--primary)', letterSpacing: '-0.5px' }}>ZAC Portal</span>
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
                background: 'rgba(10, 15, 13, 0.95)',
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
                  <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
                    <span style={{ fontSize: '1.5rem', display: 'block' }}>🌿</span>
                    {(!isCollapsed || isMobile) && (
                      <span style={{
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        fontFamily: 'var(--font-display)',
                        color: '#fff',
                        whiteSpace: 'nowrap',
                        letterSpacing: '-0.5px'
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
