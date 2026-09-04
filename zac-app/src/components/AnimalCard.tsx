'use client';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

function getBadgeColor(status: string) {
  switch (status) {
    case 'Critically Endangered': return '#ef4444';
    case 'Endangered':            return '#f97316';
    case 'Vulnerable':            return '#eab308';
    case 'Extinct':
    case 'Extinct in the Wild':   return '#94a3b8';
    case 'Near Threatened':       return '#10b981';
    default:                      return '#22c55e';
  }
}

export default function AnimalCard({ animal }: { animal: any }) {
  const rawUrl = animal.images?.[0];
  const imageUrl = rawUrl && rawUrl.trim() !== '' ? rawUrl : null;
  const fallbackSrc = `https://placehold.co/400x250/050806/22c55e?text=${encodeURIComponent(animal.name || 'Animal')}`;
  const statusColor = getBadgeColor(animal.conservationStatus);

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'rgba(8, 12, 9, 0.66)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'border-color 0.3s ease, background 0.3s ease'
      }}
      whileHover={{
        borderColor: 'var(--border-hover)',
        background: 'var(--bg-card-hover)'
      }}
    >
      {/* Image container */}
      <div style={{ overflow: 'hidden', position: 'relative', height: '180px', width: '100%' }}>
        <img
          src={imageUrl || fallbackSrc}
          alt={animal.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackSrc; }}
          loading="lazy"
          className="card-img-element"
        />

        {/* Minimal status dot indicator */}
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(5,8,6,0.72)', backdropFilter: 'blur(6px)', padding: '0.28rem 0.7rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
          <span style={{ color: 'var(--text-primary)' }}>{animal.conservationStatus}</span>
        </div>
      </div>

      {/* Content wrapper */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.3px' }}>
          {animal.name}
        </h3>
        <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.75rem' }}>
          {animal.scientificName}
        </p>

        {animal.habitat && (
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.35rem', lineHeight: 1.5 }}>
            <MapPin size={13} style={{ flexShrink: 0, marginTop: '0.12rem', color: 'var(--primary)' }} />
            <span>{animal.habitat}</span>
          </p>
        )}

        {animal.description && (
          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              opacity: 0.8,
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: '1.25rem',
            }}
            dangerouslySetInnerHTML={{ __html: animal.description }}
          />
        )}

        {/* Footer info (sightings count / wiki link) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem' }}>
          {animal.observationsCount !== undefined ? (
            <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.4px', textTransform: 'uppercase', fontSize: '0.66rem' }}>
              {animal.observationsCount?.toLocaleString()} observations
            </span>
          ) : (
            <span />
          )}
          {animal.wikipediaUrl && (
            <a
              href={animal.wikipediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--primary)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Wikipedia ↗
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
