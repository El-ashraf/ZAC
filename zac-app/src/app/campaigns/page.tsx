'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Heart, Check, Users, AlertTriangle, X } from 'lucide-react';

type Campaign = {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  targetPledges: number;
  currentPledges: number;
  threatLevel: 'Critical' | 'High' | 'Moderate';
};

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'tiger',
    title: 'Bengal Tiger Forest Corridors',
    description: 'Securing land corridors in South Asia to connect isolated tiger populations, reducing territorial conflicts and enabling secure genetic migration paths.',
    category: 'Habitat Corridors',
    image: 'https://images.unsplash.com/photo-1615966650071-855b15f29ad1?auto=format&fit=crop&q=80&w=800',
    targetPledges: 1500,
    currentPledges: 1142,
    threatLevel: 'Critical',
  },
  {
    id: 'reef',
    title: 'Bioluminescent Reef Safeguards',
    description: 'Deploying sensory monitors along vulnerable underwater trenches to prevent deep-sea resource extraction near fragile glass sponge and coral reef ecosystems.',
    category: 'Marine Sanctuary',
    image: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=800',
    targetPledges: 1000,
    currentPledges: 742,
    threatLevel: 'High',
  },
  {
    id: 'rhino',
    title: 'Javan Rhino Food Corridor Restorations',
    description: 'Replanting native forage flora (wild ginger, fig saplings) inside Ujung Kulon buffer zones to expand the range of the last Javan rhinos.',
    category: 'Reforestation',
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800',
    targetPledges: 800,
    currentPledges: 681,
    threatLevel: 'Critical',
  }
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pledgingCampaign, setPledgingCampaign] = useState<Campaign | null>(null);
  const [pledgeName, setPledgeName] = useState('');
  const [pledgeEmail, setPledgeEmail] = useState('');
  const [pledgeSuccess, setPledgeSuccess] = useState(false);

  useEffect(() => {
    // Load local storage values or defaults
    const list = INITIAL_CAMPAIGNS.map(c => {
      const savedCount = localStorage.getItem(`campaign_pledges_${c.id}`);
      if (savedCount) {
        return { ...c, currentPledges: parseInt(savedCount, 10) };
      }
      return c;
    });
    setCampaigns(list);
  }, []);

  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeName.trim() || !pledgeEmail.trim() || !pledgingCampaign) return;

    const updatedPledges = pledgingCampaign.currentPledges + 1;
    localStorage.setItem(`campaign_pledges_${pledgingCampaign.id}`, String(updatedPledges));

    setCampaigns(prev => prev.map(c => {
      if (c.id === pledgingCampaign.id) {
        return { ...c, currentPledges: updatedPledges };
      }
      return c;
    }));

    setPledgeSuccess(true);
    setTimeout(() => {
      setPledgeSuccess(false);
      setPledgingCampaign(null);
      setPledgeName('');
      setPledgeEmail('');
    }, 2000);
  };

  const getThreatColor = (level: 'Critical' | 'High' | 'Moderate') => {
    if (level === 'Critical') return '#ef4444';
    if (level === 'High') return '#fb923c';
    return '#fbbf24';
  };

  return (
    <main style={{ position: 'relative', minHeight: '90vh', padding: '5rem 1rem' }}>
      
      {/* Background Image & Overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: `url('https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&q=80&w=1920')`,
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

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mono-eyebrow"
            style={{ color: 'var(--accent)', marginBottom: '1.25rem' }}
          >
            Conservation Campaigns
          </motion.div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Protect Fragile Habitats</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '620px', margin: '0 auto', lineHeight: 1.65 }}>
            Sign a pledge to back field actions, bring habitat data to legislators, and support biological sanctuaries.
          </p>
        </div>

        {/* Campaigns Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {campaigns.map((c, idx) => {
            const percentage = Math.min(Math.round((c.currentPledges / c.targetPledges) * 100), 100);
            return (
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                key={c.id}
                className="glass"
                style={{
                  padding: '2.2rem',
                  display: 'flex',
                  gap: '2rem',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  border: '1px solid rgba(34, 197, 94, 0.18)'
                }}
              >
                {/* Visual Image */}
                <div style={{ 
                  width: '100%', 
                  maxWidth: '300px', 
                  height: '200px', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <img src={c.image} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Content */}
                <div style={{ flex: '1 1 350px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span className="mono-label" style={{ fontSize: '0.68rem', color: 'var(--primary)' }}>
                      {c.category}
                    </span>
                    <span style={{
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-display)',
                      color: getThreatColor(c.threatLevel),
                      background: `${getThreatColor(c.threatLevel)}15`,
                      border: `1px solid ${getThreatColor(c.threatLevel)}30`,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '5px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px'
                    }}>
                      {c.threatLevel} Threat
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.8rem', letterSpacing: '-0.5px' }}>
                    {c.title}
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', opacity: 0.8, lineHeight: 1.6, marginBottom: '1.5rem', fontWeight: 300 }}>
                    {c.description}
                  </p>

                  {/* Progress bar */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Users size={14} style={{ color: 'var(--primary)' }} />
                        {c.currentPledges.toLocaleString()} / {c.targetPledges.toLocaleString()} Pledges
                      </span>
                      <span>{percentage}% Signed</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--primary-glow)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, #4ade80 100%)', borderRadius: '10px', boxShadow: '0 0 6px var(--primary)' }} />
                    </div>
                  </div>

                  <button 
                    onClick={() => setPledgingCampaign(c)}
                    className="btn" 
                    style={{ 
                      fontSize: '0.82rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.4rem',
                      padding: '0.5rem 1.4rem' 
                    }}
                  >
                    <Heart size={14} />
                    <span>Pledge Support</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* PLEDGING MODAL */}
      <AnimatePresence>
        {pledgingCampaign && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(6px)',
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass"
              style={{
                width: '100%',
                maxWidth: '460px',
                padding: '2.5rem 2.2rem',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
                position: 'relative'
              }}
            >
              <button 
                onClick={() => setPledgingCampaign(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>

              {pledgeSuccess ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{
                    display: 'inline-flex',
                    background: 'rgba(34,197,94,0.1)',
                    color: 'var(--primary)',
                    borderRadius: '50%',
                    padding: '0.8rem',
                    marginBottom: '1rem',
                    border: '1px solid var(--border)'
                  }}>
                    <Check size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>Pledge Registered!</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Thank you for standing up for Zoology Animal Club sanctuaries.</p>
                </div>
              ) : (
                <form onSubmit={handlePledgeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 850, color: '#fff', marginBottom: '0.3rem', letterSpacing: '-0.5px' }}>Pledge Your Support</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Adding support for: <strong>{pledgingCampaign.title}</strong>
                    </p>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Naturalist Name</label>
                    <input 
                      type="text" 
                      required 
                      value={pledgeName}
                      onChange={e => setPledgeName(e.target.value)}
                      className="form-input" 
                      placeholder="e.g. Jane Goodall" 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={pledgeEmail}
                      onChange={e => setPledgeEmail(e.target.value)}
                      className="form-input" 
                      placeholder="you@example.com" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn" 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      fontSize: '0.95rem',
                      marginTop: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Heart size={16} />
                    <span>Sign Pledge</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
