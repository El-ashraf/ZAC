'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { PlusCircle, FileText, Check, AlertCircle } from 'lucide-react';

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

export default function AdminDashboard() {
  const { register, handleSubmit, reset, watch } = useForm<AnimalFormData>();
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isExtinctChecked = watch('isExtinct');

  const onSubmit = async (data: AnimalFormData) => {
    setSubmitting(true);
    setStatusMessage(null);

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
        setStatusMessage({ type: 'success', text: 'Animal added to database successfully!' });
        reset();
      } else {
        const err = await res.json();
        setStatusMessage({ type: 'error', text: err.error || 'Failed to add animal' });
      }
    } catch (e) {
      console.error(e);
      setStatusMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="section" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Redesigned Premium Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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
        <h1 className="section-title">🌿 Zoology Archive Manager</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
          Add new species to the Zoology Animal Club archives. Registered species will automatically be sorted into habitat, extinction, and red-list catalogs.
        </p>
      </div>

      {/* Main Glass Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="glass"
        style={{ padding: '2.5rem 3rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <PlusCircle style={{ color: 'var(--primary)' }} size={24} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 850, letterSpacing: '-0.5px' }}>Add New Species</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem 2rem' }}>
            
            {/* Common Name */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Common Name</label>
              <input
                {...register('name', { required: true })}
                className="form-input"
                placeholder="e.g. Blue Whale"
                required
              />
            </div>

            {/* Scientific Name */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Scientific Name</label>
              <input
                {...register('scientificName', { required: true })}
                className="form-input"
                placeholder="e.g. Balaenoptera musculus"
                required
              />
            </div>

            {/* Category */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Taxonomic Category</label>
              <select {...register('category', { required: true })} className="form-input" required>
                <option value="Mammal">Mammal</option>
                <option value="Reptile">Reptile</option>
                <option value="Bird">Bird</option>
                <option value="Amphibian">Amphibian</option>
                <option value="Fish">Fish</option>
                <option value="Invertebrate">Invertebrate</option>
              </select>
            </div>

            {/* Conservation Status */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Conservation Status</label>
              <select {...register('conservationStatus', { required: true })} className="form-input" required>
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

            {/* Habitat */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Primary Habitat</label>
              <input
                {...register('habitat', { required: true })}
                className="form-input"
                placeholder="e.g. Open Ocean, Tropical Forest"
                required
              />
            </div>

            {/* Diet */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Dietary Type</label>
              <input
                {...register('diet', { required: true })}
                className="form-input"
                placeholder="e.g. Carnivore (krill), Herbivore"
                required
              />
            </div>

            {/* Images */}
            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">Image URLs (comma separated)</label>
              <input
                {...register('images')}
                className="form-input"
                placeholder="https://images.unsplash.com/photo-1..., https://..."
              />
            </div>

            {/* Characteristics */}
            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">Key Characteristics</label>
              <input
                {...register('characteristics', { required: true })}
                className="form-input"
                placeholder="e.g. Largest animal on earth, communicates via deep songs"
                required
              />
            </div>

            {/* Description */}
            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">Full Description</label>
              <textarea
                {...register('description', { required: true })}
                className="form-input"
                rows={5}
                placeholder="Provide a comprehensive summary of the species' biology, distribution, threats, and protection initiatives..."
                style={{ resize: 'none' }}
                required
              ></textarea>
            </div>

            {/* Checkbox settings */}
            <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', gap: '2rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.92rem', cursor: 'pointer', fontWeight: 500 }}>
                <input type="checkbox" {...register('isAnimalOfTheWeek')} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} /> Featured Animal of the Week
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.92rem', cursor: 'pointer', fontWeight: 500 }}>
                <input type="checkbox" {...register('isDeepSea')} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} /> Deep Sea Specimen
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.92rem', cursor: 'pointer', fontWeight: 500 }}>
                <input type="checkbox" {...register('isExtinct')} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} /> Extinct Species
              </label>
            </div>

            {/* Extinction Details (Conditional rendering based on check) */}
            {isExtinctChecked && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', padding: '1.25rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.15)' }}
              >
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#f87171' }}>Extinction Year (approx.)</label>
                  <input
                    {...register('extinctionYear')}
                    className="form-input"
                    placeholder="e.g. 1681"
                    style={{ borderColor: 'rgba(239,68,68,0.2)' }}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#f87171' }}>Cause of Extinction</label>
                  <input
                    {...register('extinctionCause')}
                    className="form-input"
                    placeholder="e.g. Overhunting and habitat loss"
                    style={{ borderColor: 'rgba(239,68,68,0.2)' }}
                  />
                </div>
              </motion.div>
            )}

          </div>

          {/* Action button */}
          <button
            type="submit"
            className="btn"
            style={{ width: '100%', marginTop: '2rem', padding: '0.85rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            disabled={submitting}
          >
            {submitting ? 'Submitting Specimen...' : (
              <>
                <FileText size={18} /> Register Species
              </>
            )}
          </button>
        </form>

        {/* Status Message Banner */}
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '1.5rem',
              padding: '1rem 1.25rem',
              borderRadius: '8px',
              border: `1px solid ${statusMessage.type === 'success' ? 'var(--primary)' : 'var(--danger)'}`,
              background: statusMessage.type === 'success' ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.9rem',
              color: statusMessage.type === 'success' ? '#4ade80' : '#f87171',
            }}
          >
            {statusMessage.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{statusMessage.text}</span>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
