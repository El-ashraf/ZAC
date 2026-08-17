'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, CheckCircle2, ShieldAlert, ArrowRight, Eye, EyeOff, User, Briefcase, Camera, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [isLogin, setIsLogin] = useState(true);
  const [signupStep, setSignupStep] = useState(1); // Step 1: Account info, Step 2: Display picture
  
  // Signup details fields
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [otherName, setOtherName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Avatar Upload States
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const checks = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = checks.length && checks.hasUpper && checks.hasLower && checks.hasNumber && checks.hasSpecial;

  const validate = () => {
    if (!isLogin) {
      if (!lastName.trim()) {
        setError('Please enter your Last Name.');
        return false;
      }
      if (!firstName.trim()) {
        setError('Please enter your First Name.');
        return false;
      }
      if (!role.trim()) {
        setError('Please enter your Professional Role.');
        return false;
      }
      if (!isPasswordValid) {
        setError('Password does not meet all security requirements.');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
    }
    if (!email || !password) {
      setError('Please fill in all fields.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validate()) return;

    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    
    // Construct payload dynamically based on mode
    const payload = isLogin 
      ? { email, password } 
      : { lastName: lastName.trim(), firstName: firstName.trim(), otherName: otherName.trim(), role: role.trim(), email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please try again.');
        setLoading(false);
        return;
      }

      if (!isLogin) {
        setSuccess('Account created! Let\'s customize your profile.');
        setTimeout(() => {
          setSuccess('');
          setSignupStep(2);
          setLoading(false);
        }, 1200);
      } else {
        setSuccess('Successfully logged in!');
        // Dispatch custom event to let Navbar and other client components update immediately
        window.dispatchEvent(new Event('auth-change'));
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 1000);
      }

    } catch (err) {
      console.error(err);
      setError('A network error occurred. Please try again later.');
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setError('Display picture must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarPreview) return;
    setUploadingAvatar(true);
    setError('');
    try {
      const res = await fetch('/api/auth/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastName: lastName.trim(),
          firstName: firstName.trim(),
          otherName: otherName.trim(),
          role: role.trim(),
          avatar: avatarPreview
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile picture');
      }

      setSuccess('Display picture updated!');
      window.dispatchEvent(new Event('auth-change'));
      setTimeout(() => {
        router.push(callbackUrl);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while uploading. Please try again.');
      setUploadingAvatar(false);
    }
  };

  const handleSkipAvatar = () => {
    setSuccess('Redirecting to dashboard...');
    window.dispatchEvent(new Event('auth-change'));
    setTimeout(() => {
      router.push(callbackUrl);
      router.refresh();
    }, 1000);
  };

  const renderStep1Form = () => {
    return (
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {/* Name inputs (Sign Up Mode Only) */}
        {!isLogin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {/* First Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>First Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                <input
                  type="text"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading || !!success}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.2rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Last Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Last Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                <input
                  type="text"
                  placeholder="Goodall"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading || !!success}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.2rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Other Name (Optional) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Other Name <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>(Optional)</span></label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                <input
                  type="text"
                  placeholder="Middle / Preferred Name"
                  value={otherName}
                  onChange={(e) => setOtherName(e.target.value)}
                  disabled={loading || !!success}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.2rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Professional Role */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Professional Role *</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                <input
                  type="text"
                  placeholder="e.g. Zoologist, Field Investigator"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading || !!success}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.2rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>
          </div>
        )}

        {/* Email Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address *</label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || !!success}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem 0.65rem 2.2rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Password Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password *</label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || !!success}
              style={{
                width: '100%',
                padding: '0.65rem 2.2rem 0.65rem 2.2rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                setPasswordFocused(true);
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                setPasswordFocused(false);
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {!isLogin && (passwordFocused || password.length > 0) && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              fontSize: '0.75rem',
              background: 'rgba(255,255,255,0.02)',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              marginTop: '0.2rem',
            }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.1rem' }}>Password Requirements:</span>
              <span style={{ color: checks.length ? 'var(--primary)' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}>
                {checks.length ? '✓' : '•'} At least 8 characters
              </span>
              <span style={{ color: checks.hasUpper ? 'var(--primary)' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}>
                {checks.hasUpper ? '✓' : '•'} One uppercase letter (A-Z)
              </span>
              <span style={{ color: checks.hasLower ? 'var(--primary)' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}>
                {checks.hasLower ? '✓' : '•'} One lowercase letter (a-z)
              </span>
              <span style={{ color: checks.hasNumber ? 'var(--primary)' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}>
                {checks.hasNumber ? '✓' : '•'} One number (0-9)
              </span>
              <span style={{ color: checks.hasSpecial ? 'var(--primary)' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}>
                {checks.hasSpecial ? '✓' : '•'} One special character (!@#$%^&*)
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password (Sign Up Mode Only) */}
        {!isLogin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Confirm Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !!success}
                style={{
                  width: '100%',
                  padding: '0.65rem 2.2rem 0.65rem 2.2rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn"
          disabled={loading || !!success}
          style={{
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem',
            width: '100%',
            borderRadius: '8px',
          }}
        >
          {loading ? (
            <span className="spinner" style={{
              border: '2px solid rgba(10,15,13,0.3)',
              borderTop: '2px solid #0a0f0d',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'inline-block',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            <>
              <span>{isLogin ? 'Log In' : 'Continue to Picture Upload'}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    );
  };

  const renderStep2Form = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff', marginBottom: '0.4rem' }}>Upload Display Picture</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '320px', margin: '0 auto' }}>
            Choose a profile picture to personalize your Zoology Animal Club account. You can also do this later.
          </p>
        </div>

        {/* Display Avatar Circle */}
        <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0.5rem 0' }}>
          {avatarPreview ? (
            <img 
              src={avatarPreview} 
              alt="Avatar Preview" 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: '0 0 20px var(--primary-glow)' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '2px dashed var(--border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}>
              <Camera size={32} style={{ opacity: 0.6, marginBottom: '0.2rem' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 600 }}>Empty</span>
            </div>
          )}

          {/* Trigger file input button overlay */}
          <label style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            background: 'var(--primary)',
            color: '#0a0f0d',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '2px solid #0a0f0d',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            transition: 'transform 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <Camera size={14} />
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ display: 'none' }}
              disabled={uploadingAvatar}
            />
          </label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          {/* Save Profile Picture */}
          <button
            onClick={handleSaveAvatar}
            className="btn"
            disabled={!avatarPreview || uploadingAvatar || !!success}
            style={{
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              borderRadius: '8px',
              opacity: !avatarPreview ? 0.6 : 1,
              cursor: !avatarPreview ? 'not-allowed' : 'pointer',
            }}
          >
            {uploadingAvatar ? (
              <span className="spinner" style={{
                border: '2px solid rgba(10,15,13,0.3)',
                borderTop: '2px solid #0a0f0d',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'inline-block',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              <>
                <span>Save & Continue</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Skip Avatar */}
          <button
            onClick={handleSkipAvatar}
            disabled={uploadingAvatar || !!success}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '0.7rem',
              width: '100%',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            Skip & Go to Dashboard
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
    }}>
      {/* Background Image & Overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: `url('https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&q=80&w=1920')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }} />
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        background: 'rgba(8, 12, 10, 0.85)',
      }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.2rem 2rem',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '2.2rem', display: 'block', marginBottom: '0.4rem' }}>🌿</span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.7rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.5px'
          }}>
            {signupStep === 2 
              ? 'Customize Profile' 
              : (isLogin ? 'Welcome Back' : 'Join the Club')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {signupStep === 2 
              ? 'Add a picture to your profile' 
              : (isLogin ? 'Log in to access your dashboard' : 'Sign up to protect wildlife with us')}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                padding: '0.7rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <ShieldAlert size={15} style={{ flexShrink: 0 }} />
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
                padding: '0.7rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {signupStep === 2 ? renderStep2Form() : renderStep1Form()}

        {signupStep === 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', fontSize: '0.82rem', marginTop: '0.4rem' }}>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
            </button>
          </div>
        )}
      </motion.div>

      {/* Spinner animation style */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
