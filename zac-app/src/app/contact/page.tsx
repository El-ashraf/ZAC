'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Globe, Check, AlertCircle, FileText, Send } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSubmitting(true);

    // Mock API submission delay
    setTimeout(() => {
      // Save submission record to localStorage
      const submissions = JSON.parse(localStorage.getItem('contact_submissions') || '[]');
      submissions.push({
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('contact_submissions', JSON.stringify(submissions));

      setSubmitting(false);
      setSuccess(true);

      // Reset form fields
      setName('');
      setEmail('');
      setMessage('');
    }, 1500);
  };

  return (
    <main style={{ position: 'relative', minHeight: '90vh', padding: '5rem 1rem' }}>
      
      {/* Background Image & Overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: `url('https://images.unsplash.com/photo-1509136561187-127022f28583?auto=format&fit=crop&q=80&w=1920')`,
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
            style={{
              display: 'inline-flex',
              padding: '0.4rem 1.1rem',
              borderRadius: '40px',
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              marginBottom: '1.25rem',
              color: 'var(--ocean)',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            📬 CONTACT HEADQUARTERS
          </motion.div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Get in Touch with ZAC</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.65 }}>
            Have a question about ZAC memberships, species data catalogs, or volunteering for upcoming expeditions? Fill out the form below.
          </p>
        </div>

        {/* Contact Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          
          {/* Left Side: Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="glass"
            style={{ 
              padding: '2.5rem 2rem', 
              border: '1px solid rgba(34, 197, 94, 0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.8rem',
              justifyContent: 'center'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                Coordinates & Details
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', opacity: 0.8, lineHeight: 1.6 }}>
                Our field investigative teams operate in remote corridors, but our administrative team responds to digital logs promptly.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {[
                {
                  icon: <Mail size={18} />,
                  label: 'General Inquiries',
                  value: 'contact@zac-wildlife.org'
                },
                {
                  icon: <Phone size={18} />,
                  label: 'Expedition Center',
                  value: '+62 (21) 555-0198'
                },
                {
                  icon: <MapPin size={18} />,
                  label: 'Javan Field Station',
                  value: 'Ujung Kulon National Park, Banten, Java, ID'
                }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                  <div style={{ 
                    color: 'var(--primary)', 
                    background: 'rgba(34, 197, 94, 0.08)', 
                    padding: '0.55rem', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(34, 197, 94, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, marginTop: '0.1rem' }}>
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: '1px', background: 'var(--border)', opacity: 0.6 }} />

            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', opacity: 0.6 }}>
              ⏱️ Administrative hours: Mon - Fri, 09:00 - 17:00 (GMT+7 Javan Time)
            </div>
          </motion.div>

          {/* Right Side: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="glass"
            style={{ padding: '2.5rem 2.2rem', border: '1px solid rgba(34, 197, 94, 0.18)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.8rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <Send size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Send a Message</h3>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{ textAlign: 'center', padding: '2rem 0' }}
                >
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
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>Message Received!</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '280px', margin: '0 auto' }}>
                    Your logs have been uploaded to our database. A field coordinator will reach out shortly.
                  </p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="btn" 
                    style={{ marginTop: '1.5rem', fontSize: '0.82rem', padding: '0.5rem 1.2rem' }}
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  
                  {/* Name */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      disabled={submitting}
                      className="form-input" 
                      placeholder="Jane Goodall" 
                    />
                  </div>

                  {/* Email */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={submitting}
                      className="form-input" 
                      placeholder="you@example.com" 
                    />
                  </div>

                  {/* Subject */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Subject</label>
                    <select 
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      disabled={submitting}
                      className="form-input"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Volunteering">Volunteering & Expeditions</option>
                      <option value="Research Partnership">Research & Academic Partnerships</option>
                      <option value="Technical Support">Technical Portal Support</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Message *</label>
                    <textarea 
                      required 
                      rows={4}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      disabled={submitting}
                      className="form-input" 
                      placeholder="Write your message details here..." 
                      style={{ resize: 'none' }}
                    ></textarea>
                  </div>

                  {error && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontSize: '0.82rem' }}>
                      <AlertCircle size={14} />
                      <span>{error}</span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn" 
                    disabled={submitting}
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
                    {submitting ? 'Transmitting Message...' : (
                      <>
                        <Send size={16} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                </form>
              )}
            </AnimatePresence>
          </motion.div>

        </div>

      </div>
    </main>
  );
}
