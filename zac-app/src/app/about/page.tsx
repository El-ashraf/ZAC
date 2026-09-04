'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Users, Compass, ArrowRight, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <main style={{ position: 'relative', minHeight: '90vh', padding: '5rem 1rem' }}>
      {/* Background Image & Overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: `url('https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&q=80&w=1920')`,
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

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mono-eyebrow"
            style={{ marginBottom: '1.25rem' }}
          >
            About Zoology Animal Club
          </motion.div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Protecting Wildlife Through Technology</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '620px', margin: '0 auto', lineHeight: 1.65 }}>
            Zoology Animal Club connects conservationists, zoologists, and nature enthusiasts to catalog biodiversity in real time, using live data from iNaturalist and the IUCN Red List.
          </p>
        </div>

        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass"
          style={{ padding: '3rem', border: '1px solid rgba(34, 197, 94, 0.2)', marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', letterSpacing: '-0.5px' }}>
            Our Mission & Impact
          </h2>
          <p style={{ color: 'var(--text-primary)', lineHeight: 1.8, fontSize: '0.98rem', fontWeight: 300, marginBottom: '2rem' }}>
            You cannot protect what you do not understand. Zoology Animal Club gives researchers and citizen scientists tools to log sightings, monitor migration paths, and track conservation threats.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
            {[
              {
                title: 'Biodiversity Cataloging',
                icon: <Compass size={20} />,
                desc: 'Record global species distributions using live iNaturalist data.'
              },
              {
                title: 'Habitat Protection',
                icon: <Shield size={20} />,
                desc: 'Back rewilding initiatives in critical forest, ocean, and mountain zones.'
              },
              {
                title: 'Community Education',
                icon: <Users size={20} />,
                desc: 'Equip volunteers and schools with field logging tools for the next generation of naturalists.'
              }
            ].map((p, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ 
                  color: 'var(--primary)', 
                  background: 'rgba(34, 197, 94, 0.08)', 
                  width: 'fit-content', 
                  padding: '0.5rem', 
                  borderRadius: '10px', 
                  border: '1px solid rgba(34, 197, 94, 0.2)' 
                }}>
                  {p.icon}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{p.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', opacity: 0.8, lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass"
          style={{ 
            padding: '2.5rem', 
            border: '1px solid var(--border)', 
            textAlign: 'center', 
            background: 'var(--bg-card)',
            boxShadow: '0 15px 40px rgba(0,0,0,0.3)' 
          }}
        >
          <div style={{ color: 'var(--primary)', display: 'inline-flex', padding: '0.6rem', background: 'rgba(34, 197, 94, 0.08)', borderRadius: '50%', marginBottom: '1rem' }}>
            <Heart size={24} style={{ fill: 'currentColor' }} />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
            Join the Zoology Animal Club
          </h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.8rem', lineHeight: 1.6 }}>
            Create a naturalist profile to access the dashboard, sync iNaturalist projects, and log field observations.
          </p>
          <Link href="/login" className="btn-hero" style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}>
            Get Started <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
