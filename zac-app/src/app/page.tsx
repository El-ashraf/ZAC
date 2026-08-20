'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import AnimalCard from '@/components/AnimalCard';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Calendar, ArrowRight, BookOpen, Globe, ChevronLeft, ChevronRight, Info, AlertTriangle, Sparkles, MapPin } from 'lucide-react';

type Animal = Record<string, any>;
type Sighting = { id: number; observedOn: string; place: string; userName: string; photoUrl: string | null; uri: string };

const FACTS = [
  'A group of flamingos is called a flamboyance.',
  'Octopuses have three hearts and blue blood.',
  'Sloths can hold their breath longer than dolphins — up to 40 minutes!',
  'The mantis shrimp can punch with the force of a bullet — 1,500 Newtons.',
  'Butterflies taste food with their feet.',
  "A tiger's stripes extend to the skin — each pattern is unique like a fingerprint.",
  'Elephants are the only animals that cannot jump.',
  'A group of jellyfish is called a smack.',
  'Sharks are older than trees — they have existed for over 450 million years.',
  'Crows can recognise and remember human faces.',
  'Wombat droppings are cube-shaped — the only animal to produce cube-shaped scat.',
  'Pistol shrimp can snap their claws fast enough to create a shockwave that stuns prey.',
];

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  'Critically Endangered': { bg: 'rgba(239, 68, 68, 0.08)',  color: '#f87171', border: 'rgba(239, 68, 68, 0.25)' },
  'Endangered':            { bg: 'rgba(249, 115, 22, 0.08)', color: '#fb923c', border: 'rgba(249, 115, 22, 0.25)' },
  'Vulnerable':            { bg: 'rgba(234, 179, 8, 0.08)',  color: '#facc15', border: 'rgba(234, 179, 8, 0.25)' },
  'Near Threatened':       { bg: 'rgba(16, 185, 129, 0.08)', color: '#34d399', border: 'rgba(16, 185, 129, 0.25)' },
  'Least Concern':         { bg: 'rgba(34, 197, 94, 0.08)',  color: '#4ade80', border: 'rgba(34, 197, 94, 0.25)' },
  'Extinct':               { bg: 'rgba(148, 163, 184, 0.08)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.25)' },
  'Threatened':            { bg: 'rgba(249, 115, 22, 0.08)', color: '#fb923c', border: 'rgba(249, 115, 22, 0.25)' },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || { bg: 'rgba(99, 102, 241, 0.08)', color: '#a5b4fc', border: 'rgba(99, 102, 241, 0.2)' };
  return (
    <span style={{ 
      background: s.bg, 
      color: s.color, 
      padding: '0.35rem 0.9rem', 
      borderRadius: '40px', 
      fontWeight: 700, 
      fontSize: '0.75rem', 
      border: `1px solid ${s.border}`,
      letterSpacing: '0.3px',
      textTransform: 'uppercase',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
      {status}
    </span>
  );
}

function getFallbackDescription(name: string, category: string): string {
  if (category === 'Mammal') {
    return `The ${name} is a highly adapted mammal representing a vital link in its ecosystem's trophic structure. Like other species of its class, it possesses distinct anatomical and behavioral traits shaped by its environment, playing a crucial role in maintaining biological balance in its native habitat.`;
  }
  if (category === 'Bird') {
    return `The ${name} is an avian species featuring specialized adaptations for flight, foraging, and nesting. As an indicator species, its population levels and behavioral patterns provide critical insights into the overall ecological health and stability of its geographic range.`;
  }
  if (category === 'Reptile') {
    return `The ${name} is an ectothermic reptilian species uniquely suited to its climate and terrain. Its physiological adaptations allow it to thrive in specific ecological niches, where it operates as an essential predator or prey within the local food chain.`;
  }
  if (category === 'Amphibian') {
    return `The ${name} is an amphibian species characterized by its biphasic life cycle and highly permeable skin. Because of its sensitivity to environmental shifts, it serves as a crucial bioindicator for wetland and forest ecosystem health.`;
  }
  if (category === 'Fish') {
    return `The ${name} is an aquatic species adapted for survival in marine or freshwater environments. Its specialized sensory systems, swimming biomechanics, and feeding behaviors are key to the energy dynamics of its aquatic community.`;
  }
  return `The ${name} is a unique animal species playing an essential role in its native habitat's biodiversity. Its presence contributes to the complex ecological relationships and evolutionary heritage that define its region's natural environment.`;
}

function rewriteDescription(description: string, name: string, scientificName: string, category: string): string {
  if (!description || description.trim() === '' || description.includes('is a threatened species tracked by')) {
    return getFallbackDescription(name, category);
  }
  
  let cleaned = description.replace(/<[^>]*>/g, '');
  cleaned = cleaned.replace(/\[\d+\]/g, '');
  
  const nameParts = scientificName.split(' ');
  const regexPattern = new RegExp(`\\(\\s*${nameParts[0]}\\s*${nameParts[1] || ''}[^)]*\\)`, 'gi');
  cleaned = cleaned.replace(regexPattern, '');
  cleaned = cleaned.replace(/\(\s*also\s+known\s+as[^)]*\)/gi, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  if (cleaned.length > 250) {
    cleaned = cleaned.slice(0, 245).trim() + '...';
  }

  return cleaned;
}

export default function Home() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [featured, setFeatured] = useState<Animal | null>(null);
  const [aotWObs, setAotwObs] = useState<number | null>(null);
  const [weekNumber, setWeekNumber] = useState<number | null>(null);
  const [redList, setRedList] = useState<Animal[]>([]);
  const [recentAnimals, setRecentAnimals] = useState<Animal[]>([]);
  
  // Facts Carousel States
  const [factIndex, setFactIndex] = useState(0);
  const [isFactPaused, setIsFactPaused] = useState(false);
  const [factProgress, setFactProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [sightingsTotal, setSightingsTotal] = useState<number | null>(null);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingRed, setLoadingRed] = useState(true);
  const [loadingSpotlight, setLoadingSpotlight] = useState(true);

  const fetchFeatured = useCallback(async () => {
    try {
      const res = await fetch('/api/inat/featured');
      const data = await res.json();
      setFeatured(data.animal);
      setAotwObs(data.observationCount);
      setWeekNumber(data.weekNumber);
      if (data.animal?.scientificName) {
        const sRes = await fetch(`/api/live-sightings?taxon=${encodeURIComponent(data.animal.scientificName)}&limit=4`);
        const sData = await sRes.json();
        setSightings(sData.sightings || []);
        setSightingsTotal(sData.totalResults);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingFeatured(false); }
  }, []);

  useEffect(() => {
    fetchFeatured();

    fetch('/api/inat/endangered?limit=3')
      .then((r) => r.json())
      .then((d) => { setRedList(d); setLoadingRed(false); })
      .catch(() => setLoadingRed(false));

    fetch('/api/inat/endangered?limit=9')
      .then((r) => r.json())
      .then((d) => { setRecentAnimals(d); setLoadingSpotlight(false); })
      .catch(() => setLoadingSpotlight(false));
  }, [fetchFeatured]);

  // Facts Timer Loop (with Pause on Hover)
  useEffect(() => {
    if (isFactPaused) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      return;
    }

    const duration = 6000; // 6 seconds
    const intervalTime = 100; // 100ms ticks
    const steps = duration / intervalTime;
    let currentStep = (factProgress / 100) * steps;

    progressInterval.current = setInterval(() => {
      currentStep++;
      const nextProgress = (currentStep / steps) * 100;
      
      if (nextProgress >= 100) {
        setFactProgress(0);
        setFactIndex((p) => (p + 1) % FACTS.length);
      } else {
        setFactProgress(nextProgress);
      }
    }, intervalTime);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isFactPaused, factProgress]);

  const handleNextFact = () => {
    setFactProgress(0);
    setFactIndex((p) => (p + 1) % FACTS.length);
  };

  const handlePrevFact = () => {
    setFactProgress(0);
    setFactIndex((p) => (p - 1 + FACTS.length) % FACTS.length);
  };

  useEffect(() => {
    const checkHomeAuth = () => {
      fetch('/api/auth/me')
        .then((r) => r.json())
        .then((d) => {
          if (d.authenticated) setUser({ email: d.email });
          else setUser(null);
        })
        .catch(() => setUser(null));
    };
    checkHomeAuth();
    window.addEventListener('auth-change', checkHomeAuth);
    return () => window.removeEventListener('auth-change', checkHomeAuth);
  }, []);

  return (
    <main style={{ position: 'relative', overflowX: 'hidden' }}>
      
      {/* Background Image & Overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: `url('https://images.unsplash.com/photo-1484406566174-9da000fda645?auto=format&fit=crop&q=80&w=1920')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }} />
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        background: 'var(--bg-gradient)',
      }} />

      {/* Decorative ambient glowing mesh lights */}
      <div style={{
        position: 'fixed',
        top: '15%',
        left: '20%',
        width: '450px',
        height: '450px',
        background: 'var(--primary-glow)',
        filter: 'blur(130px)',
        borderRadius: '50%',
        opacity: 0.25,
        pointerEvents: 'none',
        zIndex: -1
      }} />
      <div style={{
        position: 'fixed',
        bottom: '25%',
        right: '15%',
        width: '500px',
        height: '500px',
        background: 'rgba(245, 158, 11, 0.08)',
        filter: 'blur(150px)',
        borderRadius: '50%',
        opacity: 0.2,
        pointerEvents: 'none',
        zIndex: -1
      }} />

      {/* Hero Section */}
      <section className="hero" style={{ minHeight: '85vh', padding: '3.5rem 1rem' }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="hero-content" 
          style={{ maxWidth: '840px', width: '100%' }}
        >
          <div className="glass" style={{
            padding: '3rem 2.5rem',
            borderRadius: '24px',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Soft inner glow line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              right: '10%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
              opacity: 0.6
            }} />

            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1.8rem', justifyContent: 'center', alignItems: 'center' }}>
              <div className="hero-eyebrow" style={{ 
                background: 'rgba(34,197,94,0.06)', 
                border: '1px solid rgba(34,197,94,0.22)', 
                color: 'var(--primary)', 
                marginBottom: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 0 15px rgba(34,197,94,0.05)'
              }}>
                <span className="live-badge" style={{ padding: 0, border: 'none', background: 'none', color: 'var(--primary)' }} />
                LIVE CONSERVATION NETWORK
              </div>

              {user ? (
                <Link href="/profile" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.45rem', 
                  fontSize: '0.78rem', 
                  fontWeight: 700, 
                  padding: '0.4rem 1.1rem', 
                  borderRadius: '20px', 
                  background: 'rgba(34,197,94,0.1)', 
                  border: '1px solid rgba(34,197,94,0.3)',
                  color: '#fff',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)'}
                >
                  <span>👤 {user.email.split('@')[0]}</span>
                </Link>
              ) : (
                <Link href="/login" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.45rem', 
                  fontSize: '0.78rem', 
                  fontWeight: 700, 
                  padding: '0.4rem 1.1rem', 
                  borderRadius: '20px', 
                  background: 'rgba(245,158,11,0.08)', 
                  border: '1px solid rgba(245,158,11,0.22)',
                  color: 'var(--accent)',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.22)'}
                >
                  <span>🔑 Log In / Sign Up</span>
                </Link>
              )}
            </div>

            <h1 style={{ 
              letterSpacing: '-2px', 
              fontWeight: 800, 
              fontSize: 'clamp(2.2rem, 6.2vw, 4.4rem)',
              lineHeight: 1.1,
              marginBottom: '1.25rem'
            }}>
              Nature in <span className="highlight" style={{ 
                fontWeight: 900,
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Focus</span>
            </h1>

            <p style={{ 
              fontSize: 'clamp(0.95rem, 2.2vw, 1.15rem)', 
              color: 'var(--text-secondary)', 
              fontWeight: 400, 
              lineHeight: 1.7, 
              marginBottom: '2.5rem',
              maxWidth: '650px'
            }}>
              Discover, catalog, and preserve our planet's rich biodiversity. Access real-time species distributions, conservation statuses, and live observations synced from iNaturalist.
            </p>

            <div className="hero-cta" style={{ justifyContent: 'center' }}>
              <Link href="/dashboard" className="btn-hero" style={{ 
                padding: '0.85rem 2.2rem',
                fontSize: '0.95rem',
                boxShadow: '0 10px 25px rgba(34, 197, 94, 0.4)'
              }}>
                Enter Dashboard <ArrowRight size={16} />
              </Link>
              <Link href="/animals" className="btn-hero-outline" style={{ 
                padding: '0.85rem 2.2rem',
                fontSize: '0.95rem',
                border: '1.5px solid rgba(255, 255, 255, 0.2)'
              }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
              >
                Database Search
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Grid-based Premium Stats Section */}
      <section style={{ 
        position: 'relative', 
        padding: '0 2rem 4rem', 
        maxWidth: 1200, 
        margin: '0 auto',
        marginTop: '-3rem'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '1.5rem'
        }}>
          {[
            { num: '900K+', label: 'Active Naturalists', icon: <Compass size={22} />, desc: 'Global community logs' },
            { num: '50M+', label: 'Logged Observations', icon: <Globe size={22} />, desc: 'Real-time sightings verified' },
            { num: '150K+', label: 'Species Cataloged', icon: <BookOpen size={22} />, desc: 'Rich biological data' },
            { num: 'iNaturalist API', label: 'Data Integration', icon: <Sparkles size={22} />, desc: 'Synced ecosystem sync' }
          ].map((s, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              key={s.label}
              className="glass"
              style={{
                padding: '1.8rem 1.5rem',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.4rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.4), 0 0 15px rgba(34, 197, 94, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
              }}
            >
              <div style={{ 
                color: 'var(--primary)', 
                background: 'rgba(34, 197, 94, 0.08)', 
                padding: '0.6rem', 
                borderRadius: '12px', 
                border: '1px solid rgba(34, 197, 94, 0.15)',
                marginBottom: '0.3rem' 
              }}>
                {s.icon}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 850, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{s.num}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.3px' }}>{s.label}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Animal of the Week - Magazine Style */}
      <section className="section" style={{ padding: '4rem 2rem' }}>
        <div style={{ 
          borderLeft: '4px solid var(--primary)', 
          paddingLeft: '1.25rem',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          flexWrap: 'wrap', 
          gap: '1rem', 
          marginBottom: '2.5rem' 
        }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ 
                background: 'rgba(245,158,11,0.08)', 
                color: '#fbbf24', 
                border: '1px solid rgba(245,158,11,0.25)', 
                borderRadius: '40px', 
                padding: '0.3rem 0.85rem', 
                fontSize: '0.72rem', 
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                ⭐ Weekly Species Spotlight
              </span>
            </div>
            <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: 0, fontFamily: 'var(--font-display)', letterSpacing: '-1px' }}>
              Animal of the Week
            </h2>
          </div>
          {aotWObs !== null && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 850, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
                {aotWObs.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Wildlife Sightings
              </div>
            </div>
          )}
        </div>

        {loadingFeatured ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <div className="skeleton" style={{ height: 320, borderRadius: 20 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
              <div className="skeleton" style={{ height: 28, width: '40%' }} />
              <div className="skeleton" style={{ height: 16, width: '90%' }} />
              <div className="skeleton" style={{ height: 16, width: '80%' }} />
              <div className="skeleton" style={{ height: 16, width: '70%' }} />
            </div>
          </div>
        ) : featured ? (
          <div className="glass" style={{ 
            padding: '2.5rem', 
            borderRadius: '24px', 
            display: 'flex', 
            gap: '2.5rem', 
            flexWrap: 'wrap', 
            alignItems: 'center', 
            border: '1px solid rgba(34, 197, 94, 0.15)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ 
              position: 'relative', 
              overflow: 'hidden', 
              borderRadius: '16px', 
              width: '100%', 
              maxWidth: '420px', 
              height: '280px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <img
                src={featured.images[0]}
                alt={featured.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/420x300/101712/22c55e?text=${encodeURIComponent(featured.name)}`; }}
              />
              <div style={{ position: 'absolute', top: 14, left: 14 }}>
                <StatusPill status={featured.conservationStatus} />
              </div>
            </div>

            <div style={{ flex: '1 1 350px' }}>
              <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', fontFamily: 'var(--font-display)' }}>
                {featured.name}
              </h3>
              <p style={{ fontStyle: 'italic', color: 'var(--primary)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                {featured.scientificName}
              </p>

              <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: 300 }}>
                {rewriteDescription(featured.description, featured.name, featured.scientificName, featured.category)}
              </p>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <span style={{ 
                  background: 'rgba(168,85,247,0.08)', 
                  color: '#c084fc', 
                  border: '1px solid rgba(168,85,247,0.25)', 
                  padding: '0.35rem 0.9rem', 
                  borderRadius: '40px', 
                  fontSize: '0.78rem', 
                  fontWeight: 700,
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase'
                }}>
                  🧬 {featured.category}
                </span>
                {featured.wikipediaUrl && (
                  <a href={featured.wikipediaUrl} target="_blank" rel="noopener noreferrer"
                    style={{ 
                      background: 'rgba(34, 197, 94, 0.05)', 
                      color: 'var(--primary)', 
                      border: '1px solid var(--border)', 
                      padding: '0.35rem 0.9rem', 
                      borderRadius: '40px', 
                      fontSize: '0.78rem', 
                      fontWeight: 700, 
                      textDecoration: 'none', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.35rem',
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.background = 'var(--primary-glow)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.background = 'rgba(34, 197, 94, 0.05)';
                    }}
                  >
                    Wikipedia <ArrowRight size={12} />
                  </a>
                )}
              </div>

              {/* Sighting markers */}
              {sightings.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.1rem' }}>
                    📍 Live iNaturalist Sightings:
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {sightings.slice(0, 3).map((s) => (
                      <a 
                        key={s.id} 
                        href={s.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.4rem', 
                          padding: '0.4rem 0.8rem', 
                          border: '1px solid var(--border)', 
                          background: 'rgba(34, 197, 94, 0.03)', 
                          borderRadius: '8px', 
                          fontSize: '0.8rem', 
                          color: 'var(--text-primary)', 
                          textDecoration: 'none',
                          transition: 'all 0.2s ease' 
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        <MapPin size={12} style={{ color: 'var(--primary)' }} />
                        {s.place.length > 25 ? s.place.slice(0, 23) + '...' : s.place}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </section>

      {/* Did You Know? - Interactive Facts Carousel Card */}
      <section style={{ padding: '0 2rem 3rem', maxWidth: 1100, margin: '0 auto' }}>
        <div 
          className="glass"
          onMouseEnter={() => setIsFactPaused(true)}
          onMouseLeave={() => setIsFactPaused(false)}
          style={{ 
            border: '1px solid rgba(34, 197, 94, 0.15)', 
            background: 'rgba(16, 22, 18, 0.55)', 
            borderRadius: '20px', 
            padding: '2.5rem 2rem', 
            textAlign: 'center', 
            position: 'relative',
            boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
            overflow: 'hidden'
          }}
        >
          {/* Header indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', color: 'var(--primary)', textTransform: 'uppercase' }}>
              🧠 WILDLIFE FACT ARCHIVE
            </span>
          </div>

          {/* Active Fact Display with Slide Animation */}
          <div style={{ minHeight: '4.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.5rem 0 1rem' }}>
            <AnimatePresence mode="wait">
              <motion.p
                key={factIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{ 
                  fontSize: '1.2rem', 
                  color: '#fff', 
                  lineHeight: 1.6, 
                  maxWidth: '700px', 
                  fontWeight: 300,
                  fontStyle: 'italic'
                }}
              >
                &ldquo;{FACTS[factIndex]}&rdquo;
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Controls: Prev / Play-Pause indicator / Next */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem' }}>
            <button 
              onClick={handlePrevFact}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              <ChevronLeft size={16} />
            </button>
            
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
              {factIndex + 1} / {FACTS.length} {isFactPaused && '(Paused)'}
            </span>

            <button 
              onClick={handleNextFact}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Bottom Timer Progress Line */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '3px',
            background: 'rgba(255,255,255,0.05)'
          }}>
            <div style={{
              height: '100%',
              width: `${factProgress}%`,
              background: 'linear-gradient(90deg, var(--primary) 0%, #4ade80 100%)',
              transition: 'width 0.1s linear',
              boxShadow: '0 0 8px var(--primary)'
            }} />
          </div>
        </div>
      </section>

      {/* Red List Highlights with Left-bar Headers */}
      <section className="section" style={{ padding: '3rem 2rem' }}>
        <div style={{ 
          borderLeft: '4px solid var(--primary)',
          paddingLeft: '1.25rem',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          marginBottom: '2rem' 
        }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: 0, fontFamily: 'var(--font-display)', letterSpacing: '-1px' }}>
              Red List Highlights
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
              Endangered wildlife monitored under iNaturalist APIs
            </p>
          </div>
          <Link href="/red-list" style={{ 
            fontSize: '0.85rem', 
            color: 'var(--primary)', 
            fontWeight: 700, 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem'
          }}>
            View Full Archive <ChevronRight size={16} />
          </Link>
        </div>

        {loadingRed ? (
          <div className="grid">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ minHeight: 300, borderRadius: 16 }} />)}
          </div>
        ) : (
          <div className="grid">
            {redList.map((a) => <AnimalCard key={a._id} animal={a} />)}
          </div>
        )}
      </section>

      {/* Threatened Spotlight */}
      <section className="section" style={{ padding: '3rem 2rem 5rem' }}>
        <div style={{ 
          borderLeft: '4px solid var(--accent)',
          paddingLeft: '1.25rem',
          marginBottom: '2rem' 
        }}>
          <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: 0, fontFamily: 'var(--font-display)', letterSpacing: '-1px' }}>
            Conservation Spotlight
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
            Recent species requiring habitat protection and census updates
          </p>
        </div>

        {loadingSpotlight ? (
          <div className="grid">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ minHeight: 300, borderRadius: 16 }} />)}
          </div>
        ) : (
          <div className="grid">
            {recentAnimals.slice(3, 9).map((a) => <AnimalCard key={a._id} animal={a} />)}
          </div>
        )}
      </section>

    </main>
  );
}
