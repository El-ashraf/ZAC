'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Search, Clock, ChevronRight } from 'lucide-react';

type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  coverImage: string;
  readTime: string;
  createdAt: string;
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetch('/api/blog')
      .then((r) => r.json())
      .then((data) => {
        setPosts(data);
        setFilteredPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Filter posts on query or category change
  useEffect(() => {
    let list = [...posts];

    if (activeCategory !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.excerpt.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q)
      );
    }

    setFilteredPosts(list);
  }, [searchQuery, activeCategory, posts]);

  const categories = ['All', 'Field Notes', 'Research', 'Expeditions', 'Initiatives'];

  return (
    <main style={{ position: 'relative', minHeight: '90vh', padding: '5rem 1rem' }}>
      
      {/* Background Image & Overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: `url('https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&q=80&w=1920')`,
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

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex',
              padding: '0.4rem 1.1rem',
              borderRadius: '40px',
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              marginBottom: '1.25rem',
              color: 'var(--primary)',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            📚 FIELD LOGS & ARTICLES
          </motion.div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>ZAC Conservation Blog</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.65 }}>
            Read recent expeditions reports, deep-sea research findings, and community conservation logs straight from the field.
          </p>
        </div>

        {/* Search & Categories Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1.5rem',
          marginBottom: '2.5rem',
          background: 'rgba(255,255,255,0.01)',
          border: '1px solid rgba(255,255,255,0.03)',
          padding: '1.25rem',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }} className="glass">
          {/* Categories */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                style={{
                  background: activeCategory === c ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: activeCategory === c ? '#0a0f0d' : 'var(--text-secondary)',
                  padding: '0.45rem 1.1rem',
                  fontSize: '0.82rem',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  transition: 'all 0.2s'
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.45)' }} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                fontSize: '0.88rem',
                borderRadius: '40px',
                margin: 0
              }}
            />
          </div>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 20 }} />)}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="glass" style={{ padding: '3rem', textAlign: 'center', border: '1px solid var(--border)', borderRadius: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: 650 }}>No articles found matching your filters.</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="btn" 
              style={{ marginTop: '1rem', fontSize: '0.82rem', padding: '0.5rem 1.2rem' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Articles Grid */
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {filteredPosts.map((p, idx) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="glass"
                  style={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '1px solid rgba(34, 197, 94, 0.15)',
                    boxShadow: '0 12px 35px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.35)';
                    e.currentTarget.style.boxShadow = '0 18px 45px rgba(0,0,0,0.45)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.15)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.3)';
                  }}
                >
                  {/* Cover Image */}
                  <div style={{ width: '100%', height: '180px', overflow: 'hidden', position: 'relative' }}>
                    <img src={p.coverImage} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      background: 'rgba(10, 15, 13, 0.72)',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--primary)',
                      border: '1px solid var(--border)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '40px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px'
                    }}>
                      {p.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Meta */}
                    <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Calendar size={12} />
                        {new Date(p.createdAt || 0).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Clock size={12} />
                        {p.readTime}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', letterSpacing: '-0.3px', lineHeight: 1.35 }}>
                      {p.title}
                    </h3>
                    
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', opacity: 0.8, lineHeight: 1.55, fontWeight: 300, marginBottom: '1.25rem' }}>
                      {p.excerpt}
                    </p>

                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
                      <span>Read Article</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
