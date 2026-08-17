'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ShieldCheck, 
  UploadCloud, 
  FolderGit2, 
  Activity, 
  ExternalLink,
  Flame,
  Globe,
  Compass,
  ArrowRight
} from 'lucide-react';

const FACTS = [
  'Deep-sea pressure can be over 1,000 atmospheres — equal to an elephant balancing on your thumb.',
  'A group of flamingos is officially called a flamboyance.',
  'iNaturalist connects over 3 million naturalists and scientists globally.',
  'The IUCN Red List is currently tracking conservation efforts for over 150,000 species.',
  'A blue whale\'s tongue can weigh as much as an entire adult elephant.'
];

export default function Dashboard() {
  const [profile, setProfile] = useState({ name: 'Explorer', role: 'Wildlife Naturalist', avatar: '' });
  const [tokenConfigured, setTokenConfigured] = useState(false);
  const [projectLinked, setProjectLinked] = useState<string | null>(null);
  const [factIndex, setFactIndex] = useState(0);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = res.ok ? await res.json() : null;
        if (data && data.authenticated) {
          const userEmail = data.email;
          
          let dbName = '';
          if (data.firstName || data.lastName) {
            dbName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
          } else {
            dbName = userEmail.split('@')[0];
          }

          const savedName = localStorage.getItem(`${userEmail}_profile_name`) || dbName;
          const savedRole = localStorage.getItem(`${userEmail}_profile_role`) || data.role || 'Wildlife Naturalist';
          const savedToken = localStorage.getItem(`${userEmail}_inat_token`) || '';
          const savedProjId = localStorage.getItem(`${userEmail}_inat_project_id`) || '';
          const savedAvatar = localStorage.getItem(`${userEmail}_avatar`) || data.avatar || '';

          setProfile({ name: savedName, role: savedRole, avatar: savedAvatar });
          setTokenConfigured(!!savedToken);

          if (savedProjId) {
            setProjectLinked(savedProjId);
          }
        }
      } catch (e) {
        console.error('Failed to sync dashboard user', e);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchUser();

    // Interval for facts
    const iv = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FACTS.length);
    }, 6000);

    return () => clearInterval(iv);
  }, []);

  if (dashboardLoading) {
    return (
      <div style={{
        height: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div className="spinner" style={{
          border: '3px solid rgba(255,255,255,0.05)',
          borderTop: '3px solid var(--primary)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Loading dashboard...</span>
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <main style={{ position: 'relative' }}>
      {/* Background configurations */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: `url('https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?auto=format&fit=crop&q=80&w=1920')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }} />
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        background: 'rgba(8, 12, 10, 0.82)',
      }} />

      <div className="section" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Welcome Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt="Profile Avatar" 
                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}
              />
            ) : (
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px dashed var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                color: 'var(--primary)',
                fontWeight: 700
              }}>
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="section-title" style={{ fontSize: '2.2rem', marginBottom: '0.2rem' }}>
                Welcome back, {profile.name}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Role: <strong>{profile.role}</strong> · Active conservation dashboard
              </p>
            </div>
          </div>
          <Link href="/profile" className="btn-hero-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}>
            Edit Profile
          </Link>
        </div>

        {/* Top Highlights Grid (Sleek Stats) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '2.5rem' }}>
          
          <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '16px' }}>
            <div style={{ 
              padding: '0.6rem', 
              borderRadius: '12px', 
              background: tokenConfigured ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)', 
              color: tokenConfigured ? 'var(--primary)' : 'var(--danger)' 
            }}>
              <UploadCloud size={22} />
            </div>
            <div>
              <div style={{ 
                fontSize: tokenConfigured ? '1.4rem' : '1.05rem', 
                fontWeight: 800, 
                color: '#fff', 
                fontFamily: 'var(--font-display)',
                whiteSpace: 'nowrap'
              }}>
                {tokenConfigured ? 'Connected' : 'No connection yet'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>iNaturalist Sync</div>
            </div>
          </div>

          <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '16px' }}>
            <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.08)', color: 'var(--ocean)' }}>
              <FolderGit2 size={22} />
            </div>
            <div>
              <div style={{ 
                fontSize: projectLinked ? '1.4rem' : '1.05rem', 
                fontWeight: 800, 
                color: '#fff', 
                fontFamily: 'var(--font-display)',
                whiteSpace: 'nowrap'
              }}>
                {projectLinked ? 'Linked' : 'No project linked'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Project</div>
            </div>
          </div>

          <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '16px' }}>
            <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.08)', color: 'var(--accent)' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>Verified</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Credentials Status</div>
            </div>
          </div>

        </div>

        {/* Center content: Thematic links & Interactive Widgets */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', marginBottom: '2.5rem' }}>
          
          {/* Left Column: Sleek Thematic Tile Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              Explore Species Archives
            </h2>
            
            {/* Red List Tile */}
            <Link href="/red-list" style={{ textDecoration: 'none' }}>
              <motion.div 
                className="glass" 
                style={{ padding: '1.5rem 2rem', borderRadius: '16px', borderLeft: '3px solid #ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
                whileHover={{ x: 5, borderColor: 'rgba(239, 68, 68, 0.4)' }}
              >
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🔴 IUCN Red List Species
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    Browse live endangered species data revolving daily to highlight vital conservation efforts.
                  </p>
                </div>
                <ArrowRight size={18} style={{ color: '#f87171' }} />
              </motion.div>
            </Link>

            {/* Deep Sea Tile */}
            <Link href="/deep-sea" style={{ textDecoration: 'none' }}>
              <motion.div 
                className="glass" 
                style={{ padding: '1.5rem 2rem', borderRadius: '16px', borderLeft: '3px solid #06b6d4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
                whileHover={{ x: 5, borderColor: 'rgba(6, 182, 212, 0.4)' }}
              >
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#22d3ee', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🌊 Deep Sea specimen
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    Discover bioluminescent species cataloged from deep oceanic trenches.
                  </p>
                </div>
                <ArrowRight size={18} style={{ color: '#22d3ee' }} />
              </motion.div>
            </Link>

            {/* Extinct Archive Tile */}
            <Link href="/extinct" style={{ textDecoration: 'none' }}>
              <motion.div 
                className="glass" 
                style={{ padding: '1.5rem 2rem', borderRadius: '16px', borderLeft: '3px solid #94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
                whileHover={{ x: 5, borderColor: 'rgba(148, 163, 184, 0.4)' }}
              >
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ☠️ Extinct Archive
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    View records of extinct wildlife to build ecological awareness and prevent future losses.
                  </p>
                </div>
                <ArrowRight size={18} style={{ color: '#cbd5e1' }} />
              </motion.div>
            </Link>

          </div>

          {/* Right Column: Widgets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* iNaturalist status tracker widget */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                🦋 iNaturalist Connection
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {tokenConfigured ? (
                  'Your local API token is active. You can publish sightings and manage observations directly.'
                ) : (
                  'Connect your iNaturalist account to upload observations and synchronize custom projects directly.'
                )}
              </p>
              <Link 
                href="/inaturalist" 
                className="btn" 
                style={{ display: 'block', textAlign: 'center', fontSize: '0.82rem', padding: '0.5rem' }}
              >
                {tokenConfigured ? 'Manage Connection' : 'Connect Account'}
              </Link>
            </div>

            {/* Quote / Did you know? Widget */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minHeight: '140px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                <Compass size={12} /> Did You Know?
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, transition: 'opacity 0.4s' }}>
                &ldquo;{FACTS[factIndex]}&rdquo;
              </p>
            </div>

          </div>

        </div>

        {/* Database administration block */}
        <div className="glass" style={{ padding: '2rem 2.5rem', borderRadius: '16px', borderLeft: '3px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              🔒 Zoology Archive Manager
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
              Register new species sightings to populate the Zoology Animal Club archives.
            </p>
          </div>
          <Link href="/admin" className="btn-hero" style={{ fontSize: '0.88rem', padding: '0.6rem 1.5rem' }}>
            Open Manager
          </Link>
        </div>

      </div>
    </main>
  );
}
