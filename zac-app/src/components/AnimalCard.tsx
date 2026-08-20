'use client';
import { motion } from 'framer-motion';

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

const STATUS_EMOJI: Record<string, string> = {
  'Critically Endangered': '🔴',
  'Endangered':            '🟠',
  'Vulnerable':            '🟡',
  'Near Threatened':       '🟢',
  'Least Concern':         '✅',
  'Extinct':               '💀',
  'Extinct in the Wild':   '☠️',
  'Not Evaluated':         '🔵',
};

export default function AnimalCard({ animal }: { animal: any }) {
  const rawUrl = animal.images?.[0];
  const imageUrl = rawUrl && rawUrl.trim() !== '' ? rawUrl : null;
  const fallbackSrc = `https://placehold.co/400x250/0d1310/22c55e?text=${encodeURIComponent(animal.name || 'Animal')}`;
  const statusColor = getBadgeColor(animal.conservationStatus);

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
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
        
        {/* Modern minimal status dot indicator */}
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--bg-glass)', backdropFilter: 'blur(6px)', padding: '0.3rem 0.75rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border)', fontSize: '0.72rem', fontWeight: 600 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }} />
          <span style={{ color: 'var(--text-primary)' }}>{animal.conservationStatus}</span>
        </div>
      </div>

      {/* Content wrapper */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem', letterSpacing: '-0.3px' }}>
          {animal.name}
        </h3>
        <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
          {animal.scientificName}
        </p>

        {animal.habitat && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>📍</span> {animal.habitat}
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
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              🔭 {animal.observationsCount?.toLocaleString()} observations
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
