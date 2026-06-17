import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import API from '../../services/api';
import './Profile.css';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const idInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    gender: user?.gender || '',
    city: user?.city || '',
    country: user?.country || '',
    bio: user?.bio || '',
    travelStyle: user?.travelStyle || '',
    budgetPreference: user?.budgetPreference || '',
    languages: user?.languages?.join(', ') || '',
    interests: user?.interests?.join(', ') || '',
    favoriteDestinations: user?.favoriteDestinations?.join(', ') || '',
  });

  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Emergency Contacts
  const [emergencyContacts, setEmergencyContacts] = useState(
    user?.emergencyContacts?.length > 0
      ? user.emergencyContacts
      : [{ name: '', relation: '', phone: '' }]
  );

  // ID Upload
  const [idPreview, setIdPreview] = useState('');
  const [idUploading, setIdUploading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('Image must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ── Emergency contact helpers ──
  const handleContactChange = (index, field, value) => {
    const updated = [...emergencyContacts];
    updated[index][field] = value;
    setEmergencyContacts(updated);
  };

  const addContact = () => {
    if (emergencyContacts.length < 3) {
      setEmergencyContacts([...emergencyContacts, { name: '', relation: '', phone: '' }]);
    }
  };

  const removeContact = (index) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const saveEmergencyContacts = async () => {
    const validContacts = emergencyContacts.filter(c => c.name && c.relation && c.phone);
    try {
      const { data } = await API.put('/safety/emergency-contacts', { emergencyContacts: validContacts });
      updateUser({ ...user, emergencyContacts: data.data });
      setSuccessMsg('Emergency contacts saved!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save contacts');
    }
  };

  // ── ID Upload ──
  const handleIdSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('ID document must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setIdPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const submitIdForVerification = async () => {
    if (!idPreview) return;
    setIdUploading(true);
    try {
      const { data } = await API.post('/safety/upload-id', { idDocument: idPreview });
      setSuccessMsg(data.message);
      setIdPreview('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload ID');
    } finally {
      setIdUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Convert comma-separated strings to arrays
    const formattedData = {
      ...formData,
      profilePicture,
      languages: formData.languages ? formData.languages.split(',').map(s => s.trim()).filter(Boolean) : [],
      interests: formData.interests ? formData.interests.split(',').map(s => s.trim()).filter(Boolean) : [],
      favoriteDestinations: formData.favoriteDestinations ? formData.favoriteDestinations.split(',').map(s => s.trim()).filter(Boolean) : [],
    };

    try {
      const { data } = await API.put('/auth/profile', formattedData);
      if (data.success) {
        updateUser(data.data);
        navigate('/profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Edit Profile</h1>
      
      {error && <div className="card" style={{ backgroundColor: '#fee2e2', color: '#991b1b', marginBottom: '1rem', padding: '1rem' }}>{error}</div>}
      {successMsg && <div className="card" style={{ backgroundColor: '#d1fae5', color: '#065f46', marginBottom: '1rem', padding: '1rem' }}>{successMsg}</div>}

      <form className="edit-profile-form" onSubmit={handleSubmit}>
        
        <div className="image-upload-container">
          {profilePicture ? (
            <img 
              src={profilePicture} 
              alt="Profile Preview" 
              className="image-upload-preview" 
              onClick={() => fileInputRef.current?.click()}
            />
          ) : (
            <div 
              className="profile-avatar-placeholder" 
              style={{ cursor: 'pointer' }}
              onClick={() => fileInputRef.current?.click()}
            >
              +
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            className="file-input-hidden" 
            onChange={handleImageChange}
          />
          <button type="button" className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
            Change Photo
          </button>
          <small style={{ color: 'var(--text-muted)' }}>Max size: 2MB (JPEG/PNG)</small>
        </div>

        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Basic Info</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Age</label>
            <input type="number" name="age" className="form-input" value={formData.age} onChange={handleChange} min="18" max="120" />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" className="form-input" value={formData.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input type="text" name="city" className="form-input" value={formData.city} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Country</label>
            <input type="text" name="country" className="form-input" value={formData.country} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea name="bio" className="form-input" rows="4" value={formData.bio} onChange={handleChange} maxLength="500" placeholder="Tell us a bit about yourself..."></textarea>
        </div>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Travel Preferences</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Travel Style</label>
            <select name="travelStyle" className="form-input" value={formData.travelStyle} onChange={handleChange}>
              <option value="">Select Style</option>
              <option value="Backpacker">Backpacker</option>
              <option value="Luxury">Luxury</option>
              <option value="Adventure">Adventure</option>
              <option value="Relaxation">Relaxation</option>
              <option value="Cultural">Cultural</option>
              <option value="Business">Business</option>
            </select>
          </div>
          <div className="form-group">
            <label>Budget Preference</label>
            <select name="budgetPreference" className="form-input" value={formData.budgetPreference} onChange={handleChange}>
              <option value="">Select Budget</option>
              <option value="Budget">Budget</option>
              <option value="Moderate">Moderate</option>
              <option value="Luxury">Luxury</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Languages (comma separated)</label>
          <input type="text" name="languages" className="form-input" value={formData.languages} onChange={handleChange} placeholder="English, Spanish, French" />
        </div>

        <div className="form-group">
          <label>Interests (comma separated)</label>
          <input type="text" name="interests" className="form-input" value={formData.interests} onChange={handleChange} placeholder="Hiking, Photography, Food" />
        </div>

        <div className="form-group">
          <label>Favorite Destinations (comma separated)</label>
          <input type="text" name="favoriteDestinations" className="form-input" value={formData.favoriteDestinations} onChange={handleChange} placeholder="Paris, Tokyo, Bali" />
        </div>

        {/* ── Trust & Safety: ID Verification ── */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          🛡️ Trust & Safety
        </h3>

        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.75rem' }}>
            Identity Verification {user?.isVerified && <span style={{ color: '#10b981' }}>✅ Verified</span>}
          </h4>
          {user?.isVerified ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Your identity has been verified. Other travelers can see a verification badge on your profile.
            </p>
          ) : (
            <>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Upload a clear photo of your government-issued ID (passport, driver's license, or national ID card) to receive a verified badge. Your ID will be reviewed and deleted after verification.
              </p>
              {idPreview && (
                <div style={{ position: 'relative', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                  <img src={idPreview} alt="ID Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', background: '#f5f5f5' }} />
                  <button type="button" onClick={() => setIdPreview('')} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>✕</button>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                  📄 Select ID Document
                  <input type="file" accept="image/*" ref={idInputRef} style={{ display: 'none' }} onChange={handleIdSelect} />
                </label>
                {idPreview && (
                  <button type="button" className="btn btn-primary" onClick={submitIdForVerification} disabled={idUploading}>
                    {idUploading ? 'Submitting...' : 'Submit for Verification'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Emergency Contacts ── */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          🆘 Emergency Contacts
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Add up to 3 emergency contacts. These will be accessible to trip group members for safety.
        </p>

        {emergencyContacts.map((contact, index) => (
          <div key={index} className="card" style={{ padding: '1rem', marginBottom: '1rem', position: 'relative' }}>
            {emergencyContacts.length > 1 && (
              <button
                type="button"
                onClick={() => removeContact(index)}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            )}
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input type="text" className="form-input" value={contact.name} onChange={(e) => handleContactChange(index, 'name', e.target.value)} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Relation</label>
                <input type="text" className="form-input" value={contact.relation} onChange={(e) => handleContactChange(index, 'relation', e.target.value)} placeholder="Parent, Spouse, Friend" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" className="form-input" value={contact.phone} onChange={(e) => handleContactChange(index, 'phone', e.target.value)} placeholder="+1 234 567 890" />
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          {emergencyContacts.length < 3 && (
            <button type="button" className="btn btn-outline" onClick={addContact}>
              + Add Contact
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={saveEmergencyContacts}>
            Save Contacts
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/profile')} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
