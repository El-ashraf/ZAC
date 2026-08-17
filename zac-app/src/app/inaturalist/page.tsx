'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  UploadCloud, 
  PlusCircle, 
  Search, 
  MapPin, 
  Calendar, 
  Info, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  FolderPlus, 
  FileImage,
  RefreshCw
} from 'lucide-react';

type ProjectInfo = {
  id: number;
  title: string;
  description: string;
  slug: string;
  icon: string | null;
  header_image_url: string | null;
  project_type: string;
  observations_count?: number;
};

type TaxonInfo = {
  id: string;
  name: string;
  scientificName: string;
  image?: string;
  category?: string;
};

export default function INaturalistHub() {
  const [activeTab, setActiveTab] = useState<'settings' | 'upload' | 'create'>('upload');
  
  // Settings State
  const [pageLoading, setPageLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [token, setToken] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectSearchResults, setProjectSearchResults] = useState<ProjectInfo[]>([]);
  const [projectSearching, setProjectSearching] = useState(false);
  const [projectLoading, setProjectLoading] = useState(false);
  const [tokenVerified, setTokenVerified] = useState<boolean | null>(null);
  
  // Upload State
  const [localAnimals, setLocalAnimals] = useState<any[]>([]);
  const [localAnimalsLoading, setLocalAnimalsLoading] = useState(false);
  const [taxonSearch, setTaxonSearch] = useState('');
  const [taxonSearchResults, setTaxonSearchResults] = useState<TaxonInfo[]>([]);
  const [taxonSearching, setTaxonSearching] = useState(false);
  const [selectedTaxon, setSelectedTaxon] = useState<TaxonInfo | null>(null);
  
  const [observedOn, setObservedOn] = useState('');
  const [placeGuess, setPlaceGuess] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [geolocationLoading, setGeolocationLoading] = useState(false);
  
  // Submit state
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'creating_obs' | 'uploading_photo' | 'linking_project' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [createdObsUrl, setCreatedObsUrl] = useState('');
  
  // Project Creator Helper state
  const [helperProjName, setHelperProjName] = useState('');
  const [helperProjDesc, setHelperProjDesc] = useState('');
  const [helperProjType, setHelperProjType] = useState('traditional');

  // Load saved credentials on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = res.ok ? await res.json() : null;
        if (data && data.authenticated) {
          const email = data.email;
          setUserEmail(email);

          const savedToken = localStorage.getItem(`${email}_inat_token`) || '';
          const savedProjId = localStorage.getItem(`${email}_inat_project_id`) || '';
          setToken(savedToken);
          setProjectId(savedProjId);

          if (savedToken) {
            verifyToken(savedToken);
          }
          if (savedProjId) {
            await fetchProjectInfo(savedProjId, email);
          }
        }
      } catch (e) {
        console.error('Failed to load user email in iNaturalist page', e);
      } finally {
        setPageLoading(false);
      }
    };

    fetchUser();

    // Set default date-time to now
    const now = new Date();
    const tzoffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - tzoffset)).toISOString().slice(0, 16);
    setObservedOn(localISOTime);

    // Load ZAC local database animals
    fetchLocalAnimals();
  }, []);

  // Fetch local ZAC database animals
  const fetchLocalAnimals = async () => {
    setLocalAnimalsLoading(true);
    try {
      const res = await fetch('/api/animals');
      if (res.ok) {
        const data = await res.json();
        setLocalAnimals(data);
      }
    } catch (e) {
      console.error('Failed to fetch ZAC database animals', e);
    } finally {
      setLocalAnimalsLoading(false);
    }
  };

  // Verify iNaturalist token by retrieving user details
  const verifyToken = async (jwtToken: string) => {
    if (!jwtToken.trim()) return;
    setTokenVerified(null);
    try {
      const res = await fetch('https://api.inaturalist.org/v1/users/me', {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      if (res.ok) {
        setTokenVerified(true);
      } else {
        setTokenVerified(false);
      }
    } catch {
      setTokenVerified(false);
    }
  };

  // Fetch linked project details
  const fetchProjectInfo = async (idOrSlug: string, emailArg?: string) => {
    if (!idOrSlug.trim()) return;
    setProjectLoading(true);
    try {
      const res = await fetch(`https://api.inaturalist.org/v1/projects/${encodeURIComponent(idOrSlug)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setProjectInfo(data.results[0]);
          const targetEmail = emailArg || userEmail;
          if (targetEmail) {
            localStorage.setItem(`${targetEmail}_inat_project_id`, String(data.results[0].id));
          }
        } else {
          setProjectInfo(null);
        }
      } else {
        setProjectInfo(null);
      }
    } catch (e) {
      console.error('Error fetching project details', e);
      setProjectInfo(null);
    } finally {
      setProjectLoading(false);
    }
  };

  // Search iNaturalist projects for autocomplete
  useEffect(() => {
    if (!projectSearch.trim()) {
      setProjectSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setProjectSearching(true);
      try {
        const res = await fetch(`https://api.inaturalist.org/v1/projects/autocomplete?q=${encodeURIComponent(projectSearch)}`);
        if (res.ok) {
          const data = await res.json();
          setProjectSearchResults(data.results || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setProjectSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [projectSearch]);

  // Search iNaturalist species for autocomplete
  useEffect(() => {
    if (!taxonSearch.trim()) {
      setTaxonSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setTaxonSearching(true);
      try {
        const res = await fetch(`/api/search-inat?q=${encodeURIComponent(taxonSearch)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          const mapped: TaxonInfo[] = data.results.map((r: any) => ({
            id: r._id.replace('inat_', ''),
            name: r.name,
            scientificName: r.scientificName,
            image: r.images?.[0] || '',
            category: r.category
          }));
          setTaxonSearchResults(mapped);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setTaxonSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [taxonSearch]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;
    localStorage.setItem(`${userEmail}_inat_token`, token.trim());
    verifyToken(token.trim());
    alert('Settings saved locally in browser!');
  };

  const handleSelectProject = (project: ProjectInfo) => {
    if (!userEmail) return;
    setProjectId(String(project.id));
    setProjectInfo(project);
    localStorage.setItem(`${userEmail}_inat_project_id`, String(project.id));
    setProjectSearch('');
    setProjectSearchResults([]);
    alert(`Linked to project: ${project.title}`);
  };

  const handleDisconnectProject = () => {
    if (!userEmail) return;
    setProjectId('');
    setProjectInfo(null);
    localStorage.removeItem(`${userEmail}_inat_project_id`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectZacAnimal = async (animalId: string) => {
    if (!animalId) return;
    const selected = localAnimals.find((a) => a._id === animalId);
    if (!selected) return;

    // Search iNaturalist for the exact scientific name
    setTaxonSearching(true);
    try {
      const res = await fetch(`/api/search-inat?q=${encodeURIComponent(selected.scientificName)}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const match = data.results[0];
          setSelectedTaxon({
            id: match._id.replace('inat_', ''),
            name: match.name,
            scientificName: match.scientificName,
            image: match.images?.[0] || '',
            category: match.category
          });
          setTaxonSearch('');
          setTaxonSearchResults([]);
        } else {
          // Fallback if not found on iNat
          setSelectedTaxon({
            id: '',
            name: selected.name,
            scientificName: selected.scientificName,
            image: selected.images?.[0] || ''
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTaxonSearching(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeolocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude.toFixed(6)));
        setLongitude(String(position.coords.longitude.toFixed(6)));
        setGeolocationLoading(false);
      },
      (error) => {
        console.warn('Geolocation lookup declined or unavailable:', error.message || error);
        alert(`Error getting location: ${error.message || 'Permission denied or timed out'}`);
        setGeolocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleUploadObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      alert('Please configure your iNaturalist API token in Settings first.');
      setActiveTab('settings');
      return;
    }

    setUploadStatus('creating_obs');
    setUploadMessage('Submitting observation metadata to iNaturalist...');
    setCreatedObsUrl('');

    try {
      const payload = new FormData();
      payload.append('token', token.trim());
      if (selectedTaxon?.id) payload.append('taxon_id', selectedTaxon.id);
      payload.append('observed_on_string', observedOn);
      payload.append('place_guess', placeGuess);
      payload.append('latitude', latitude);
      payload.append('longitude', longitude);
      payload.append('description', description);
      if (projectId) payload.append('project_id', projectId);
      if (selectedFile) payload.append('file', selectedFile);

      const res = await fetch('/api/inat/upload-observation', {
        method: 'POST',
        body: payload
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit observation');
      }

      setCreatedObsUrl(data.url);

      // Save recent observation to profile activity log
      try {
        const newObs = {
          id: data.observationId,
          url: data.url,
          speciesName: selectedTaxon?.name || 'Unknown Species',
          date: new Date().toLocaleDateString('en-GB')
        };
        if (userEmail) {
          const recent = JSON.parse(localStorage.getItem(`${userEmail}_recent_observations`) || '[]');
          localStorage.setItem(`${userEmail}_recent_observations`, JSON.stringify([newObs, ...recent].slice(0, 10)));
        }
      } catch (err) {
        console.error('Failed to log observation to local profile history:', err);
      }

      if (selectedFile && !data.photoUploaded) {
        setUploadStatus('success');
        setUploadMessage(`Observation created, but photo upload failed: ${data.photoError || 'Unknown error'}`);
      } else if (projectId && !data.projectLinked) {
        setUploadStatus('success');
        setUploadMessage(`Observation created and photo uploaded, but failed to link to traditional project: ${data.projectError || 'Check if you are a member of the project'}`);
      } else {
        setUploadStatus('success');
        setUploadMessage('Observation uploaded and synced successfully to iNaturalist!');
      }

      // Reset form on success
      setSelectedTaxon(null);
      setSelectedFile(null);
      setFilePreview(null);
      setDescription('');
      setPlaceGuess('');
      setLatitude('');
      setLongitude('');

    } catch (e: any) {
      console.error(e);
      setUploadStatus('error');
      setUploadMessage(e.message || 'An error occurred during upload.');
    }
  };

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
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Loading sync page...</span>
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
    <main className="section" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'inline-flex', padding: '0.5rem 1.2rem', borderRadius: '40px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', marginBottom: '1rem', color: 'var(--primary)', gap: '0.5rem', alignItems: 'center', fontSize: '0.88rem', fontWeight: 600 }}
        >
          🦋 INATURALIST CITIZEN SCIENCE SYNC
        </motion.div>
        <h1 className="section-title">🌿 iNaturalist Hub</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
          Connect your project, plan field studies, and upload animal observations directly from ZAC to the global iNaturalist platform.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('upload')}
          className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`}
          style={{ background: activeTab === 'upload' ? 'rgba(34,197,94,0.1)' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.6rem 1.2rem', borderRadius: '8px' }}
        >
          <UploadCloud size={18} /> Upload Observation
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
          style={{ background: activeTab === 'settings' ? 'rgba(34,197,94,0.1)' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.6rem 1.2rem', borderRadius: '8px' }}
        >
          <Settings size={18} /> Connect & settings
          {tokenVerified && <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />}
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`nav-link ${activeTab === 'create' ? 'active' : ''}`}
          style={{ background: activeTab === 'create' ? 'rgba(34,197,94,0.1)' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.6rem 1.2rem', borderRadius: '8px' }}
        >
          <PlusCircle size={18} /> Create Project Guide
        </button>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="glass"
            style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}
          >
            {/* API Credentials */}
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🔑 Authenticate API Access
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                iNaturalist write access requires a Personal API JWT Token. ZAC stores this token locally on your computer. It never gets stored permanently on our server.
              </p>

              <form onSubmit={handleSaveSettings}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Personal API Token (JWT)</span>
                    <a href="https://www.inaturalist.org/users/api_token" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem' }}>
                      Get your token here <ExternalLink size={12} />
                    </a>
                  </label>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiJ9..."
                    className="form-input"
                    style={{ letterSpacing: '2px', fontFamily: 'monospace' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button type="submit" className="btn">Save Credentials</button>
                  {tokenVerified === true && (
                    <span style={{ color: '#4ade80', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                      <CheckCircle size={18} /> Token Verified (Connected)
                    </span>
                  )}
                  {tokenVerified === false && (
                    <span style={{ color: '#f87171', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                      <AlertCircle size={18} /> Token Invalid/Expired
                    </span>
                  )}
                  {token && tokenVerified === null && (
                    <button type="button" onClick={() => verifyToken(token)} className="btn-hero-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                      Verify Token
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={{ height: '1px', background: 'var(--border)' }} />

            {/* Project linkage */}
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📂 Link iNaturalist Project
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Search for your existing iNaturalist project (Traditional or Collection) to link it. Newly created observations will optionally be added to this project.
              </p>

              {projectInfo ? (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {projectInfo.icon ? (
                    <img src={projectInfo.icon} alt={projectInfo.title} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '60px', height: '60px', borderRadius: '10px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.5rem' }}>🦋</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{projectInfo.title}</h3>
                      <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '0.7rem' }}>
                        {projectInfo.project_type} project
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {projectInfo.description || 'No description provided.'}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>ID: <strong>{projectInfo.id}</strong></span>
                      <span>Slug: <strong>{projectInfo.slug}</strong></span>
                    </div>
                  </div>
                  <button onClick={handleDisconnectProject} style={{ padding: '0.4rem 1rem', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                    Disconnect
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#86efac' }} />
                      <input
                        type="text"
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        placeholder="Search project by name (e.g. Zoology Conservation Club)..."
                        className="form-input"
                        style={{ paddingLeft: '2.8rem' }}
                      />
                    </div>
                    {projectLoading && (
                      <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                        <Loader2 className="animate-spin" size={20} />
                      </div>
                    )}
                  </div>

                  {/* Autocomplete dropdown */}
                  {projectSearchResults.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', zIndex: 10, marginTop: '0.5rem', maxHeight: '250px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
                      {projectSearchResults.map((project) => (
                        <div
                          key={project.id}
                          onClick={() => handleSelectProject(project)}
                          style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'background 0.2s' }}
                          className="autocomplete-item"
                        >
                          {project.icon ? (
                            <img src={project.icon} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '0.9rem' }}>🦋</div>
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{project.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Type: {project.project_type}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {projectSearching && (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Searching projects...
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="glass"
            style={{ padding: '2.5rem' }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📸 Upload Field Observation
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Publish an animal sighting directly to the global database. If you have linked a project, it will be associated.
            </p>

            <form onSubmit={handleUploadObservation} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              {/* Left Column: Species & Metadata */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                
                {/* Select Species Source */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Step 1: Select Animal from Zoology Archives</label>
                  {localAnimalsLoading ? (
                    <div>Loading local archives...</div>
                  ) : (
                    <select 
                      onChange={(e) => handleSelectZacAnimal(e.target.value)} 
                      className="form-input" 
                      defaultValue=""
                    >
                      <option value="">-- Choose local animal --</option>
                      {localAnimals.map((animal) => (
                        <option key={animal._id} value={animal._id}>
                          {animal.name} ({animal.scientificName})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  <Info size={14} /> Or lookup any species directly on iNaturalist:
                </div>

                {/* iNaturalist Autocomplete Lookup */}
                <div className="form-group" style={{ margin: 0, position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#86efac' }} />
                    <input
                      type="text"
                      value={taxonSearch}
                      onChange={(e) => setTaxonSearch(e.target.value)}
                      placeholder="Search iNaturalist species (e.g. Panthera leo)..."
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>

                  {taxonSearching && (
                    <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Searching species...</div>
                  )}

                  {taxonSearchResults.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', zIndex: 10, marginTop: '0.5rem', maxHeight: '200px', overflowY: 'auto', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}>
                      {taxonSearchResults.map((taxon) => (
                        <div
                          key={taxon.id}
                          onClick={() => {
                            setSelectedTaxon(taxon);
                            setTaxonSearch('');
                            setTaxonSearchResults([]);
                          }}
                          style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                        >
                          {taxon.image ? (
                            <img src={taxon.image} alt="" style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '0.8rem' }}>🐾</div>
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{taxon.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{taxon.scientificName}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Taxon Badge */}
                {selectedTaxon && (
                  <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {selectedTaxon.image ? (
                      <img src={selectedTaxon.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.2rem' }}>🐾</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{selectedTaxon.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{selectedTaxon.scientificName}</div>
                    </div>
                    <button type="button" onClick={() => setSelectedTaxon(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}>
                      ✕
                    </button>
                  </div>
                )}

                {/* Date Observed */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={15} /> Date & Time Observed
                  </label>
                  <input
                    type="datetime-local"
                    value={observedOn}
                    onChange={(e) => setObservedOn(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                {/* Place Guess */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Place Guess / Location Name</label>
                  <input
                    type="text"
                    value={placeGuess}
                    onChange={(e) => setPlaceGuess(e.target.value)}
                    placeholder="e.g. Yosemite National Park, CA"
                    className="form-input"
                  />
                </div>

                {/* Coordinates (Latitude / Longitude) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="e.g. 37.8651"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="e.g. -119.5383"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Geolocation Button */}
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="btn-hero-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem', fontSize: '0.88rem' }}
                  disabled={geolocationLoading}
                >
                  {geolocationLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Retrieving location...
                    </>
                  ) : (
                    <>
                      <MapPin size={16} /> Use My Current Location
                    </>
                  )}
                </button>

              </div>

              {/* Right Column: Media, Notes & Submit */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                
                {/* Photo Drag & Drop / Selection */}
                <div className="form-group" style={{ margin: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileImage size={15} /> Upload Observation Image
                  </label>
                  <div 
                    style={{ 
                      flex: 1,
                      border: '2px dashed var(--border)', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justify: 'center', 
                      padding: '1.5rem',
                      background: 'rgba(255,255,255,0.01)',
                      cursor: 'pointer',
                      position: 'relative',
                      minHeight: '200px'
                    }}
                    onClick={() => document.getElementById('photo-upload-input')?.click()}
                  >
                    {filePreview ? (
                      <div style={{ position: 'absolute', inset: 8, borderRadius: '6px', overflow: 'hidden' }}>
                        <img src={filePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setFilePreview(null);
                          }}
                          style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                        <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Click to select image file</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>PNG, JPG, JPEG up to 5MB</span>
                      </>
                    )}
                    <input
                      id="photo-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                {/* Description / Field Notes */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Field Notes / Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe behaviors, habitat details, colors, health status..."
                    className="form-input"
                    rows={4}
                    style={{ resize: 'none' }}
                  />
                </div>

                {/* Project association indicator */}
                {projectInfo && (
                  <div style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--ocean)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Info size={14} /> Linked: Added to <strong>{projectInfo.title}</strong> automatically on upload.
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  className="btn"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: 'auto' }}
                  disabled={uploadStatus === 'creating_obs' || uploadStatus === 'uploading_photo' || uploadStatus === 'linking_project'}
                >
                  {(uploadStatus === 'creating_obs' || uploadStatus === 'uploading_photo' || uploadStatus === 'linking_project') ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Submitting Sighting...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={18} /> Upload to iNaturalist
                    </>
                  )}
                </button>

              </div>

            </form>

            {/* Upload Stepper & Status Banner */}
            {uploadStatus !== 'idle' && (
              <div 
                style={{ 
                  marginTop: '2rem', 
                  borderRadius: '10px', 
                  border: `1px solid ${uploadStatus === 'error' ? 'var(--danger)' : uploadStatus === 'success' ? 'var(--primary)' : 'var(--border)'}`, 
                  padding: '1.25rem 1.5rem',
                  background: uploadStatus === 'error' ? 'rgba(239,68,68,0.04)' : uploadStatus === 'success' ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  {uploadStatus === 'error' ? (
                    <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
                  ) : uploadStatus === 'success' ? (
                    <CheckCircle size={20} style={{ color: 'var(--primary)' }} />
                  ) : (
                    <Loader2 className="animate-spin" size={20} style={{ color: 'var(--primary)' }} />
                  )}
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
                    {uploadStatus === 'error' ? 'Upload Failed' : uploadStatus === 'success' ? 'Observation Uploaded Successfully!' : 'Processing Sighting'}
                  </h4>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginLeft: '1.8rem' }}>
                  {uploadMessage}
                </p>

                {createdObsUrl && (
                  <div style={{ marginTop: '1rem', marginLeft: '1.8rem' }}>
                    <a 
                      href={createdObsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-hero" 
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem', gap: '0.3rem' }}
                    >
                      View Sighting on iNaturalist <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="glass"
            style={{ padding: '2.5rem' }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ➕ Create iNaturalist Project
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Plan and configure your project details here, then launch the official iNaturalist creator.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
              
              {/* Planner Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Project Name</label>
                  <input
                    type="text"
                    value={helperProjName}
                    onChange={(e) => setHelperProjName(e.target.value)}
                    placeholder="e.g. Zoology Animal Club - California Chapter"
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Project Description</label>
                  <textarea
                    value={helperProjDesc}
                    onChange={(e) => setHelperProjDesc(e.target.value)}
                    placeholder="Describe target species, geographical ranges, and conservation goals..."
                    className="form-input"
                    rows={4}
                    style={{ resize: 'none' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Project Type</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="projType"
                        value="traditional"
                        checked={helperProjType === 'traditional'}
                        onChange={() => setHelperProjType('traditional')}
                      /> Traditional Project
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="projType"
                        value="collection"
                        checked={helperProjType === 'collection'}
                        onChange={() => setHelperProjType('collection')}
                      /> Collection Project
                    </label>
                  </div>
                </div>

                {/* Important Alert banner */}
                <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid var(--accent-glow)', borderRadius: '8px', padding: '1rem', fontSize: '0.82rem', color: 'var(--accent)', display: 'flex', gap: '0.75rem' }}>
                  <Info size={24} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Requirements for project creators:</strong> To prevent spam, iNaturalist requires your user account to have at least <strong>50 verifiable observations</strong> and a verified email address before creating a project.
                  </div>
                </div>

                {/* Launch Button */}
                <a
                  href="https://www.inaturalist.org/projects/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem', fontSize: '1rem', textAlign: 'center' }}
                >
                  <FolderPlus size={18} /> Launch iNaturalist Project Creator <ExternalLink size={14} />
                </a>

              </div>

              {/* Instructions Sidebar */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  📋 Step-by-Step Guide
                </h3>
                
                <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-secondary)' }}>
                  <li>
                    <strong>Define details:</strong> Use the planner on the left to copy-paste names and descriptions directly.
                  </li>
                  <li>
                    <strong>Select Type:</strong>
                    <ul style={{ paddingLeft: '1rem', marginTop: '0.2rem', listStyleType: 'disc' }}>
                      <li><em>Traditional:</em> Observations must be added manually. Ideal for curated datasets.</li>
                      <li><em>Collection:</em> Gathers observations automatically based on filters (e.g. specific species or place).</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Create on iNat:</strong> Click the launcher button to configure filters, location rules, and upload project logo banners.
                  </li>
                  <li>
                    <strong>Link to ZAC:</strong> Once created, copy the project's numerical ID or URL slug and input it in the **Connect** tab here to sync!
                  </li>
                </ol>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .autocomplete-item:hover {
          background: rgba(34,197,94,0.08) !important;
        }
      `}</style>
    </main>
  );
}
