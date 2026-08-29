'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, CheckCircle, AlertCircle, Bookmark, Compass, Camera, Trash2 } from 'lucide-react';

type SightingLog = {
  id: number;
  url: string;
  speciesName: string;
  date: string;
};

export default function Profile() {
  const router = useRouter();

  // User core details state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [otherName, setOtherName] = useState('');
  const [role, setRole] = useState('Wildlife Naturalist');
  const [email, setEmail] = useState('');
  const [joinedDate, setJoinedDate] = useState('');
  const [avatar, setAvatar] = useState('');

  // Editing state
  const [editing, setEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editOtherName, setEditOtherName] = useState('');
  const [editRole, setEditRole] = useState('');

  // iNaturalist connections state
  const [tokenConfigured, setTokenConfigured] = useState(false);
  const [projectLinked, setProjectLinked] = useState<string | null>(null);
  const [recentUploads, setRecentUploads] = useState<SightingLog[]>([]);

  // Loader and Notification states
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = res.ok ? await res.json() : null;
        if (data && data.authenticated) {
          const userEmail = data.email;
          const dbFirstName = data.firstName || '';
          const dbLastName = data.lastName || '';
          const dbOtherName = data.otherName || '';
          const dbRole = data.role || 'Wildlife Naturalist';
          const dbAvatar = data.avatar || '';

          const savedFirstName = localStorage.getItem(`${userEmail}_profile_firstname`) || dbFirstName;
          const savedLastName = localStorage.getItem(`${userEmail}_profile_lastname`) || dbLastName;
          const savedOtherName = localStorage.getItem(`${userEmail}_profile_othername`) || dbOtherName;
          const savedRole = localStorage.getItem(`${userEmail}_profile_role`) || dbRole;
          const savedAvatar = localStorage.getItem(`${userEmail}_avatar`) || dbAvatar;

          const savedDate = localStorage.getItem(`${userEmail}_profile_joined`) || new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
          const savedToken = localStorage.getItem(`${userEmail}_inat_token`) || '';
          const savedProjId = localStorage.getItem(`${userEmail}_inat_project_id`) || '';
          const savedUploads = JSON.parse(localStorage.getItem(`${userEmail}_recent_observations`) || '[]');

          setFirstName(savedFirstName);
          setLastName(savedLastName);
          setOtherName(savedOtherName);
          setRole(savedRole);
          setEmail(userEmail);
          setAvatar(savedAvatar);
          setJoinedDate(savedDate);
          setTokenConfigured(!!savedToken);
          setProjectLinked(savedProjId || null);
          setRecentUploads(savedUploads);

          // Sync database values back to local storage if missing
          if (!localStorage.getItem(`${userEmail}_profile_firstname`)) {
            localStorage.setItem(`${userEmail}_profile_firstname`, savedFirstName);
          }
          if (!localStorage.getItem(`${userEmail}_profile_lastname`)) {
            localStorage.setItem(`${userEmail}_profile_lastname`, savedLastName);
          }
          if (!localStorage.getItem(`${userEmail}_profile_joined`)) {
            localStorage.setItem(`${userEmail}_profile_joined`, savedDate);
          }
          if (dbAvatar && !localStorage.getItem(`${userEmail}_avatar`)) {
            localStorage.setItem(`${userEmail}_avatar`, dbAvatar);
          }
        } else {
          router.push('/login');
        }
      } catch (e) {
        console.error('Failed to sync profile', e);
      } finally {
        setPageLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleEdit = () => {
    setEditFirstName(firstName);
    setEditLastName(lastName);
    setEditOtherName(otherName);
    setEditRole(role);
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
          otherName: editOtherName.trim(),
          role: editRole.trim(),
          avatar: avatar
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile details.');
      }

      setFirstName(editFirstName.trim());
      setLastName(editLastName.trim());
      setOtherName(editOtherName.trim());
      setRole(editRole.trim());

      localStorage.setItem(`${email}_profile_firstname`, editFirstName.trim());
      localStorage.setItem(`${email}_profile_lastname`, editLastName.trim());
      localStorage.setItem(`${email}_profile_othername`, editOtherName.trim());
      localStorage.setItem(`${email}_profile_role`, editRole.trim());
      localStorage.setItem(`${email}_profile_name`, `${editFirstName.trim()} ${editLastName.trim()}`);

      setSuccess('Profile updated successfully!');
      setEditing(false);
      
      // Dispatch event to sync navbar/sidebar names
      window.dispatchEvent(new Event('auth-change'));
    } catch (err: any) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setError('Display picture must be under 2MB.');
        return;
      }
      setUploadingAvatar(true);
      setError('');
      setSuccess('');
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          const res = await fetch('/api/auth/profile/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName,
              lastName,
              otherName,
              role,
              avatar: base64
            })
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Failed to upload display picture.');
          }

          setAvatar(base64);
          localStorage.setItem(`${email}_avatar`, base64);
          setSuccess('Display picture updated!');
          
          window.dispatchEvent(new Event('auth-change'));
          setUploadingAvatar(false);
        };
        reader.readAsDataURL(file);
      } catch (err: any) {
        setError(err.message || 'Failed to upload display picture.');
        setUploadingAvatar(false);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you absolutely sure you want to delete your account? This action will permanently remove all your user details, settings, and observations history from our server and your browser. This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/profile/delete', {
        method: 'POST'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete account.');
      }

      // Purge local storage settings
      localStorage.removeItem(`${email}_profile_firstname`);
      localStorage.removeItem(`${email}_profile_lastname`);
      localStorage.removeItem(`${email}_profile_othername`);
      localStorage.removeItem(`${email}_profile_role`);
      localStorage.removeItem(`${email}_profile_email`);
      localStorage.removeItem(`${email}_profile_name`);
      localStorage.removeItem(`${email}_profile_joined`);
      localStorage.removeItem(`${email}_avatar`);
      localStorage.removeItem(`${email}_inat_token`);
      localStorage.removeItem(`${email}_inat_project_id`);
      localStorage.removeItem(`${email}_recent_observations`);

      setSuccess('Your account was successfully deleted. Redirecting...');
      setTimeout(() => {
        window.dispatchEvent(new Event('auth-change'));
        router.push('/');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to delete account.');
      setDeleting(false);
    }
  };

  const displayName = `${firstName} ${lastName}`.trim() || 'Explorer';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'EX';

  if (pageLoading) {
    return (
      <div style={{
        height: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div className="spinner" style={{
          border: '3px solid rgba(255,255,255,0.05)',
          borderTop: '3px solid var(--primary)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Loading profile...</span>
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <main style={{ position: 'relative' }}>
      {/* Background configurations */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: `url('https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=1920')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }} />
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        background: 'rgba(8, 12, 10, 0.82)',
      }} />

      <div className="section" style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                color: '#4ade80',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem'
              }}
            >
              <CheckCircle size={16} />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* Visual Profile Panel */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass"
            style={{ padding: '2.5rem 2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          >
            {/* Avatar Circle with Camera Overlay */}
            <div style={{ position: 'relative', width: '90px', height: '90px', marginBottom: '1.25rem' }}>
              {uploadingAvatar ? (
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '2px solid var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(8,12,10,0.6)'
                }}>
                  <div className="spinner" style={{
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderTop: '2px solid var(--primary)',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    animation: 'spin 1s linear infinite'
                  }} />
                </div>
              ) : avatar ? (
                <img 
                  src={avatar} 
                  alt="Profile Avatar" 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', boxShadow: '0 0 12px var(--primary-glow)' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--primary-glow)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', textShadow: '0 0 10px var(--primary-glow)' }}>
                  {initials}
                </div>
              )}

              {/* Upload image overlay icon */}
              <label style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                background: 'var(--primary)',
                color: '#0a0f0d',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2.5px solid #080c0a',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                transition: 'transform 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <Camera size={12} />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  style={{ display: 'none' }}
                  disabled={uploadingAvatar || deleting}
                />
              </label>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>{displayName}</h2>
            {otherName && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '0.1rem' }}>({otherName})</p>}
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>{role}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Member since {joinedDate}</p>

            <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '1.5rem 0' }} />

            {/* Configured Connections */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem', textAlign: 'left', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {tokenConfigured ? (
                  <>
                    <CheckCircle size={16} style={{ color: 'var(--primary)' }} />
                    <span style={{ color: 'var(--text-primary)' }}>iNaturalist Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} style={{ color: 'var(--danger)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>iNaturalist Disconnected</span>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bookmark size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ color: 'var(--text-primary)' }}>
                  Project: <strong>{projectLinked ? `Linked (ID: ${projectLinked})` : 'None'}</strong>
                </span>
              </div>
            </div>

            {!editing && (
              <button 
                onClick={handleEdit} 
                className="btn-hero" 
                style={{ width: '100%', marginTop: '2rem', fontSize: '0.85rem', padding: '0.6rem' }}
                disabled={deleting}
              >
                Edit Settings
              </button>
            )}
          </motion.div>

          {/* Details / Edit Form Panel */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass"
            style={{ padding: '2.5rem 2rem', borderRadius: '16px', flex: 1 }}
          >
            {editing ? (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  Edit Profile Information
                </h3>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {/* First name */}
                  <div className="form-group" style={{ margin: 0, flex: 1 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                      <User size={13} /> First Name
                    </label>
                    <input
                      type="text"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="form-input"
                      disabled={saving}
                      required
                    />
                  </div>

                  {/* Last name */}
                  <div className="form-group" style={{ margin: 0, flex: 1 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                      <User size={13} /> Last Name
                    </label>
                    <input
                      type="text"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="form-input"
                      disabled={saving}
                      required
                    />
                  </div>
                </div>

                {/* Other Name */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                    <User size={13} /> Other Name / Middle Name
                  </label>
                  <input
                    type="text"
                    value={editOtherName}
                    onChange={(e) => setEditOtherName(e.target.value)}
                    className="form-input"
                    disabled={saving}
                  />
                </div>

                {/* Role */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                    <Compass size={13} /> Role / Title
                  </label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="form-input"
                    disabled={saving}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button 
                    type="submit" 
                    className="btn" 
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="spinner" style={{
                        border: '2px solid rgba(10,15,13,0.3)',
                        borderTop: '2px solid #0a0f0d',
                        borderRadius: '50%',
                        width: '14px',
                        height: '14px',
                        display: 'inline-block',
                        animation: 'spin 1s linear infinite'
                      }} />
                    ) : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditing(false)} 
                    className="btn-hero-outline" 
                    style={{ flex: 1, padding: '0.5rem' }}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>

              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    Profile Details
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span>First Name</span>
                      <strong style={{ color: '#fff', wordBreak: 'break-all', textAlign: 'right' }}>{firstName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span>Last Name</span>
                      <strong style={{ color: '#fff', wordBreak: 'break-all', textAlign: 'right' }}>{lastName}</strong>
                    </div>
                    {otherName && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span>Other Name</span>
                        <strong style={{ color: '#fff', wordBreak: 'break-all', textAlign: 'right' }}>{otherName}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span>Email Address</span>
                      <strong style={{ color: '#fff', wordBreak: 'break-all', textAlign: 'right' }}>{email}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span>Role</span>
                      <strong style={{ color: '#fff', wordBreak: 'break-all', textAlign: 'right' }}>{role}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span>Joined Date</span>
                      <strong style={{ color: '#fff', wordBreak: 'break-all', textAlign: 'right' }}>{joinedDate}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ height: '1px', background: 'var(--border)' }} />

                {/* Upload History Log */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    📜 Recent Uploads Log
                  </h3>
                  {recentUploads.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '160px', overflowY: 'auto' }}>
                      {recentUploads.map((obs) => (
                        <a
                          key={obs.id}
                          href={obs.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem', textDecoration: 'none', color: 'var(--text-secondary)', transition: 'border-color 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                        >
                          <span>{obs.speciesName}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{obs.date} ↗</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                      No observation uploads recorded in this user account yet.
                    </p>
                  )}
                </div>

                <div style={{ height: '1px', background: 'var(--border)', marginTop: '0.5rem' }} />

                {/* Delete Account Panel */}
                <div style={{ 
                  background: 'rgba(239, 68, 68, 0.03)', 
                  border: '1px dashed rgba(239, 68, 68, 0.25)', 
                  padding: '1.25rem', 
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                    <Trash2 size={16} /> Danger Zone
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                    Deleting your account is permanent. All your profile settings, display picture, iNaturalist tokens, links, and recent activities will be permanently erased.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#f87171',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      padding: '0.55rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  >
                    {deleting ? (
                      <span className="spinner" style={{
                        border: '2px solid rgba(239, 113, 113, 0.3)',
                        borderTop: '2px solid #ef4444',
                        borderRadius: '50%',
                        width: '14px',
                        height: '14px',
                        display: 'inline-block',
                        animation: 'spin 1s linear infinite'
                      }} />
                    ) : 'Delete Zoology Animal Club Account'}
                  </button>
                </div>

              </div>
            )}
          </motion.div>

        </div>

      </div>
      
      {/* Global spin animations styling inside profile */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
