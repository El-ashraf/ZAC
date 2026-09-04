'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src="/logo.png" alt="Zoology Animal Club" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--primary)', fontSize: '0.85rem' }}>Zoology Animal Club</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[['/', 'Home'], ['/animals', 'Database'], ['/red-list', 'Red List'], ['/deep-sea', 'Deep Sea'], ['/extinct', 'Extinct']].map(([href, label]) => (
              <Link key={href} href={href} style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'var(--font-display)', letterSpacing: '0.8px', textTransform: 'uppercase', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = '')}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.78rem' }}>
          <p>© {new Date().getFullYear()} Zoology Animal Club · Protecting Wildlife, Preserving the Future</p>

          <p style={{ color: 'var(--text-muted)' }}>
            Data sourced live from{' '}
            <a href="https://www.inaturalist.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>iNaturalist</a>
            {' & '}
            <a href="https://www.iucnredlist.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>IUCN Red List</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
