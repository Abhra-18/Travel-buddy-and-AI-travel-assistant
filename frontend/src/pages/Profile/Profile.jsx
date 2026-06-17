import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import API from '../../services/api';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (user && user._id) {
      setLoadingReviews(true);
      API.get(`/reviews/${user._id}`)
        .then(res => {
          setReviews(res.data.data || []);
          setLoadingReviews(false);
        })
        .catch(err => {
          console.error('Failed to fetch reviews', err);
          setLoadingReviews(false);
        });
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        {user.profilePicture ? (
          <img src={user.profilePicture} alt={user.name} className="profile-avatar" />
        ) : (
          <div className="profile-avatar-placeholder">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="profile-info">
          <h1>
            {user.name}
            {user.isVerified && <span style={{ color: '#10b981', marginLeft: '8px', fontSize: '1.2rem' }} title="Verified">✅</span>}
          </h1>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ background: 'var(--color-surface-alt)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
              🛡️ Trust Score: {user.trustScore || 0}/100
            </span>
            <span style={{ background: 'var(--color-surface-alt)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
              ⭐ {user.averageRating ? user.averageRating.toFixed(1) : 'New'} ({user.totalReviews || 0} reviews)
            </span>
          </div>
          <p>
            {user.city || user.country ? (
              <span>📍 {user.city}{user.city && user.country ? ', ' : ''}{user.country}</span>
            ) : (
              <span>📍 Location not set</span>
            )}
          </p>
          <p>✉️ {user.email}</p>
        </div>
        <div className="profile-actions">
          <Link to="/profile/edit" className="btn btn-primary">
            Edit Profile
          </Link>
        </div>
      </div>

      {user.bio && (
        <div className="profile-section" style={{ marginBottom: '2rem' }}>
          <h2>About Me</h2>
          <p style={{ color: 'var(--text-main)', lineHeight: '1.6' }}>{user.bio}</p>
        </div>
      )}

      <div className="profile-grid">
        <div className="profile-section">
          <h2>Travel Preferences</h2>
          <div className="profile-detail">
            <strong>Travel Style</strong>
            <span>{user.travelStyle || 'Not set'}</span>
          </div>
          <div className="profile-detail">
            <strong>Budget</strong>
            <span>{user.budgetPreference || 'Not set'}</span>
          </div>
          
          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--text-main)' }}>
            Favorite Destinations
          </h3>
          <div className="profile-tags">
            {user.favoriteDestinations?.length > 0 ? (
              user.favoriteDestinations.map((dest, i) => (
                <span key={i} className="profile-tag">✈️ {dest}</span>
              ))
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>None added yet</span>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h2>Personal Details</h2>
          <div className="profile-detail">
            <strong>Age</strong>
            <span>{user.age || 'Not set'}</span>
          </div>
          <div className="profile-detail">
            <strong>Gender</strong>
            <span>{user.gender || 'Not set'}</span>
          </div>
          
          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--text-main)' }}>
            Languages
          </h3>
          <div className="profile-tags">
            {user.languages?.length > 0 ? (
              user.languages.map((lang, i) => (
                <span key={i} className="profile-tag">🗣️ {lang}</span>
              ))
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>None added yet</span>
            )}
          </div>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--text-main)' }}>
            Interests
          </h3>
          <div className="profile-tags">
            {user.interests?.length > 0 ? (
              user.interests.map((interest, i) => (
                <span key={i} className="profile-tag">🌟 {interest}</span>
              ))
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>None added yet</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="profile-section" style={{ marginTop: '2rem' }}>
        <h2>Buddy Reviews ({user.totalReviews || 0})</h2>
        {loadingReviews ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Complete a trip to get reviewed!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {reviews.map(review => (
              <div key={review._id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>{review.reviewer?.name || 'Anonymous'}</strong>
                    <span style={{ color: '#f59e0b' }}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Trip: {review.trip?.title || 'Unknown'}
                  </span>
                </div>
                {review.comment && <p style={{ color: 'var(--text-main)', marginTop: '0.5rem' }}>"{review.comment}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
