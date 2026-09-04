'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { PlusCircle, FileText, Check, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

type AnimalFormData = {
  name: string;
  scientificName: string;
  category: string;
  conservationStatus: string;
  habitat: string;
  diet: string;
  images: string;
  characteristics: string;
  description: string;
  isAnimalOfTheWeek: boolean;
  isDeepSea: boolean;
  isExtinct: boolean;
  extinctionYear: string;
  extinctionCause: string;
};

type BlogFormData = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  coverImage: string;
  readTime: string;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'species' | 'blog'>('species');
  
  // Animal Form
  const { register: registerAnimal, handleSubmit: handleSubmitAnimal, reset: resetAnimal, watch: watchAnimal } = useForm<AnimalFormData>();
  const [submittingAnimal, setSubmittingAnimal] = useState(false);
  const [animalStatus, setAnimalStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const isExtinctChecked = watchAnimal('isExtinct');

  // Blog Form
  const { register: registerBlog, handleSubmit: handleSubmitBlog, reset: resetBlog } = useForm<BlogFormData>({
    defaultValues: {
      category: 'Field Notes',
      readTime: '5 min read',
      coverImage: 'https://images.unsplash.com/photo-1574068468668-a05a11f871da?auto=format&fit=crop&q=80&w=800'
    }
  });
  const [submittingBlog, setSubmittingBlog] = useState(false);
  const [blogStatus, setBlogStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const onAnimalSubmit = async (data: AnimalFormData) => {
    setSubmittingAnimal(true);
    setAnimalStatus(null);

    const payload = {
      ...data,
      images: data.images ? data.images.split(',').map((url) => url.trim()).filter((url) => url !== '') : [],
      isAnimalOfTheWeek: Boolean(data.isAnimalOfTheWeek),
      isDeepSea: Boolean(data.isDeepSea),
      isExtinct: Boolean(data.isExtinct),
    };

    try {
      const res = await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setAnimalStatus({ type: 'success', text: 'Animal added to database successfully!' });
        resetAnimal();
      } else {
        const err = await res.json();
        setAnimalStatus({ type: 'error', text: err.error || 'Failed to add animal' });
      }
    } catch (e) {
      console.error(e);
      setAnimalStatus({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setSubmittingAnimal(false);
    }
  };

  const onBlogSubmit = async (data: BlogFormData) => {
    setSubmittingBlog(true);
    setBlogStatus(null);

    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setBlogStatus({ type: 'success', text: 'Blog article published successfully!' });
        resetBlog();
      } else {
        const err = await res.json();
        setBlogStatus({ type: 'error', text: err.error || 'Failed to publish blog post' });
      }
    } catch (e) {
      console.error(e);
      setBlogStatus({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setSubmittingBlog(false);
    }
  };

  return (
    <main className="section" style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Redesigned Premium Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'inline-flex',
            padding: '0.5rem 1.2rem',
            borderRadius: '40px',
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            marginBottom: '1rem',
            color: 'var(--primary)',
            gap: '0.5rem',
            alignItems: 'center',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          🔐 SECURE ARCHIVE PORTAL
        </motion.div>
        <h1 className="section-title">Zoology Archive Manager</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
          Add new species to the catalog or write field logs for the Zoology Animal Club blog.
        </p>
      </div>

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => setActiveTab('species')}
          className="btn-hero-outline"
          style={{
            background: activeTab === 'species' ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
            borderColor: activeTab === 'species' ? 'var(--primary)' : 'rgba(255,255,255,0.15)',
            color: activeTab === 'species' ? '#0a0f0d' : '#fff',
            padding: '0.65rem 1.8rem',
            fontSize: '0.9rem',
            borderRadius: '40px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Sparkles size={16} style={{ marginRight: '0.4rem' }} />
          Species Manager
        </button>
        <button
          onClick={() => setActiveTab('blog')}
          className="btn-hero-outline"
          style={{
            background: activeTab === 'blog' ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
            borderColor: activeTab === 'blog' ? 'var(--primary)' : 'rgba(255,255,255,0.15)',
            color: activeTab === 'blog' ? '#0a0f0d' : '#fff',
            padding: '0.65rem 1.8rem',
            fontSize: '0.9rem',
            borderRadius: '40px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <BookOpen size={16} style={{ marginRight: '0.4rem' }} />
          Blog Manager
        </button>
      </div>

      {/* SPECIES MANAGER FORM */}
      {activeTab === 'species' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass"
          style={{ padding: '2.5rem 3rem', border: '1px solid rgba(34, 197, 94, 0.2)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <PlusCircle style={{ color: 'var(--primary)' }} size={24} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 850, letterSpacing: '-0.5px' }}>Register New Species</h2>
          </div>

          <form onSubmit={handleSubmitAnimal(onAnimalSubmit)}>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem 2rem' }}>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Common Name</label>
                <input
                  {...registerAnimal('name', { required: true })}
                  className="form-input"
                  placeholder="e.g. Blue Whale"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Scientific Name</label>
                <input
                  {...registerAnimal('scientificName', { required: true })}
                  className="form-input"
                  placeholder="e.g. Balaenoptera musculus"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Taxonomic Category</label>
                <select {...registerAnimal('category', { required: true })} className="form-input" required>
                  <option value="Mammal">Mammal</option>
                  <option value="Reptile">Reptile</option>
                  <option value="Bird">Bird</option>
                  <option value="Amphibian">Amphibian</option>
                  <option value="Fish">Fish</option>
                  <option value="Invertebrate">Invertebrate</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Conservation Status</label>
                <select {...registerAnimal('conservationStatus', { required: true })} className="form-input" required>
                  <option value="Least Concern">Least Concern</option>
                  <option value="Near Threatened">Near Threatened</option>
                  <option value="Vulnerable">Vulnerable</option>
                  <option value="Endangered">Endangered</option>
                  <option value="Critically Endangered">Critically Endangered</option>
                  <option value="Extinct in the Wild">Extinct in the Wild</option>
                  <option value="Extinct">Extinct</option>
                  <option value="Not Evaluated">Not Evaluated</option>
                  <option value="Data Deficient">Data Deficient</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Primary Habitat</label>
                <input
                  {...registerAnimal('habitat', { required: true })}
                  className="form-input"
                  placeholder="e.g. Open Ocean, Tropical Forest"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Dietary Type</label>
                <input
                  {...registerAnimal('diet', { required: true })}
                  className="form-input"
                  placeholder="e.g. Carnivore, Herbivore"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Image URLs (comma separated)</label>
                <input
                  {...registerAnimal('images')}
                  className="form-input"
                  placeholder="https://images.unsplash.com/photo-1..., https://..."
                />
              </div>

              <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Key Characteristics</label>
                <input
                  {...registerAnimal('characteristics', { required: true })}
                  className="form-input"
                  placeholder="e.g. Largest animal on earth, communicates via deep songs"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Full Description</label>
                <textarea
                  {...registerAnimal('description', { required: true })}
                  className="form-input"
                  rows={5}
                  placeholder="Provide a comprehensive summary of the species' biology, threats..."
                  style={{ resize: 'none' }}
                  required
                ></textarea>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', gap: '2rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.92rem', cursor: 'pointer', fontWeight: 500 }}>
                  <input type="checkbox" {...registerAnimal('isAnimalOfTheWeek')} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} /> Featured Animal of the Week
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.92rem', cursor: 'pointer', fontWeight: 500 }}>
                  <input type="checkbox" {...registerAnimal('isDeepSea')} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} /> Deep Sea Specimen
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.92rem', cursor: 'pointer', fontWeight: 500 }}>
                  <input type="checkbox" {...registerAnimal('isExtinct')} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} /> Extinct Species
                </label>
              </div>

              {isExtinctChecked && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', padding: '1.25rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.15)' }}
                >
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: '#f87171' }}>Extinction Year (approx.)</label>
                    <input
                      {...registerAnimal('extinctionYear')}
                      className="form-input"
                      placeholder="e.g. 1681"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: '#f87171' }}>Cause of Extinction</label>
                    <input
                      {...registerAnimal('extinctionCause')}
                      className="form-input"
                      placeholder="e.g. Overhunting and invasive species"
                    />
                  </div>
                </motion.div>
              )}

            </div>

            <button
              type="submit"
              className="btn"
              style={{ width: '100%', marginTop: '2rem', padding: '0.85rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              disabled={submittingAnimal}
            >
              {submittingAnimal ? 'Submitting Specimen...' : (
                <>
                  <FileText size={18} /> Register Species
                </>
              )}
            </button>
          </form>

          {animalStatus && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '1.5rem',
                padding: '1rem 1.25rem',
                borderRadius: '8px',
                border: `1px solid ${animalStatus.type === 'success' ? 'var(--primary)' : 'var(--danger)'}`,
                background: animalStatus.type === 'success' ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.9rem',
                color: animalStatus.type === 'success' ? '#4ade80' : '#f87171',
              }}
            >
              {animalStatus.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              <span>{animalStatus.text}</span>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* BLOG MANAGER FORM */}
      {activeTab === 'blog' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass"
          style={{ padding: '2.5rem 3rem', border: '1px solid rgba(34, 197, 94, 0.2)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <BookOpen style={{ color: 'var(--primary)' }} size={24} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 850, letterSpacing: '-0.5px' }}>Publish New Field Log</h2>
          </div>

          <form onSubmit={handleSubmitBlog(onBlogSubmit)}>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem 2rem' }}>
              
              {/* Title */}
              <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Article Title</label>
                <input
                  {...registerBlog('title', { required: true })}
                  className="form-input"
                  placeholder="e.g. Tracking Wolves in the Białowieża Forest"
                  required
                />
              </div>

              {/* Author */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Author Name</label>
                <input
                  {...registerBlog('author', { required: true })}
                  className="form-input"
                  placeholder="e.g. Dr. Jane Goodall"
                  required
                />
              </div>

              {/* Category */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category</label>
                <select {...registerBlog('category', { required: true })} className="form-input" required>
                  <option value="Field Notes">Field Notes</option>
                  <option value="Research">Research</option>
                  <option value="Expeditions">Expeditions</option>
                  <option value="Initiatives">Initiatives</option>
                </select>
              </div>

              {/* Read Time */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Estimated Read Time</label>
                <input
                  {...registerBlog('readTime', { required: true })}
                  className="form-input"
                  placeholder="e.g. 5 min read"
                  required
                />
              </div>

              {/* Cover Image */}
              <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Cover Image URL</label>
                <input
                  {...registerBlog('coverImage', { required: true })}
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  required
                />
              </div>

              {/* Excerpt */}
              <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Short Summary (Excerpt)</label>
                <input
                  {...registerBlog('excerpt', { required: true })}
                  className="form-input"
                  placeholder="A brief 1-2 sentence description of the article..."
                  required
                />
              </div>

              {/* Content */}
              <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Article Body (Markdown Supported)</label>
                <textarea
                  {...registerBlog('content', { required: true })}
                  className="form-input"
                  rows={8}
                  placeholder="Write your article contents here. Markdown tags like # Headers, **bold**, and bullet points are supported..."
                  style={{ resize: 'none' }}
                  required
                ></textarea>
              </div>

            </div>

            <button
              type="submit"
              className="btn"
              style={{ width: '100%', marginTop: '2rem', padding: '0.85rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              disabled={submittingBlog}
            >
              {submittingBlog ? 'Publishing Post...' : (
                <>
                  <FileText size={18} /> Publish Blog Post
                </>
              )}
            </button>
          </form>

          {blogStatus && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '1.5rem',
                padding: '1rem 1.25rem',
                borderRadius: '8px',
                border: `1px solid ${blogStatus.type === 'success' ? 'var(--primary)' : 'var(--danger)'}`,
                background: blogStatus.type === 'success' ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.9rem',
                color: blogStatus.type === 'success' ? '#4ade80' : '#f87171',
              }}
            >
              {blogStatus.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              <span>{blogStatus.text}</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </main>
  );
}
