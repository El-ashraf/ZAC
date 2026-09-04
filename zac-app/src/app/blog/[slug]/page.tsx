'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, ArrowLeft, ArrowRight } from 'lucide-react';

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

export default function BlogPostDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog')
      .then((r) => r.json())
      .then((data: BlogPost[]) => {
        const found = data.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
        setPost(found || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

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

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Back Link */}
        <div style={{ marginBottom: '2rem' }}>
          <Link 
            href="/blog" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              color: 'var(--primary)', 
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>
        </div>

        {loading ? (
          <div className="glass" style={{ padding: '4rem', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div className="skeleton" style={{ height: '30px', width: '60%', margin: '0 auto 1.5rem', borderRadius: '4px' }} />
            <div className="skeleton" style={{ height: '20px', width: '40%', margin: '0 auto 2.5rem', borderRadius: '4px' }} />
            <div className="skeleton" style={{ height: '250px', width: '100%', borderRadius: '12px' }} />
          </div>
        ) : !post ? (
          <div className="glass" style={{ padding: '4rem', textAlign: 'center', border: '1px solid rgba(239,68,68,0.2)' }}>
            <h2 style={{ color: '#f87171', fontWeight: 800, marginBottom: '1rem' }}>Log File Not Found</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              The requested conservation report slug does not correspond to a registered database log.
            </p>
            <Link href="/blog" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              Return to Blog <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Meta */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '1rem' }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>{post.category}</span>
              <span>•</span>
              <span>{new Date(post.createdAt || 0).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-1px',
              lineHeight: 1.25,
              marginBottom: '1.25rem',
              fontFamily: 'var(--font-display)'
            }}>
              {post.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
              <User size={14} />
              <span>By <strong>{post.author}</strong> — Zoology Animal Club Field Correspondent</span>
            </div>

            {/* Full-width Cover Image */}
            <div style={{
              width: '100%',
              height: '420px',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '3rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}>
              <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Article Content */}
            <div
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.85,
                color: '#e2f0d9',
                fontWeight: 300,
              }}
              dangerouslySetInnerHTML={{
                __html: post.content
                  .replace(/### (.*)/g, '<h4 style="font-size: 1.3rem; font-weight: 800; color: #fff; margin-top: 2rem; margin-bottom: 0.75rem; letter-spacing: -0.3px;">$1</h4>')
                  .replace(/\*\*(.*)\*\*/g, '<strong style="color: #fff; font-weight: 700;">$1</strong>')
                  .replace(/\n\n/g, '<p style="margin-bottom: 1.5rem;"></p>')
              }}
            />
          </motion.article>
        )}
      </div>
    </main>
  );
}
