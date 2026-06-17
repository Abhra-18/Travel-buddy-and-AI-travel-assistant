import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import useAuth from '../../hooks/useAuth';
import { ReportModal, BlockModal } from '../../components/Safety/SafetyModals';
import ReviewModal from '../../components/Reviews/ReviewModal';
import { MatchCardSkeleton } from '../../components/Skeletons/Skeletons';
import './BuddyFinder.css';

// ── Animated Compat Bar ──────────────────────────────────────
const CompatBar = ({ percentage }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(percentage), 100);
    return () => clearTimeout(t);
  }, [percentage]);

  return (
    <div className="match-card__compat-bar-wrap">
      <div className="match-card__compat-label">
        <span>Compatibility</span>
        <span>{percentage}%</span>
      </div>
      <div className="match-card__compat-bar">
        <div className="match-card__compat-fill" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
};

// ── Individual Match Card ────────────────────────────────────
const MatchCard = ({ match, user, onFollowToggle, onReportClick, onBlockClick, onReviewClick }) => {
  const isFollowing = user?.following?.includes(match._id);
  const {
    name,
    profilePicture,
    city,
    country,
    travelStyle,
    budgetPreference,
    personalityType,
    bio,
    matchPercentage,
    matchReasons,
    isVerified,
    averageRating,
    totalReviews,
    trustScore,
  } = match;

  const location = [city, country].filter(Boolean).join(', ') || 'Location unknown';

  return (
    <div className="match-card">
      {/* Header */}
      <div className="match-card__header">
        {profilePicture ? (
          <img src={profilePicture} alt={name} className="match-card__avatar" />
        ) : (
          <div className="match-card__avatar-placeholder">
            {name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        <div className="match-card__header-info">
          <div className="match-card__name">
            {name}
            {isVerified && <span style={{ color: '#10b981', marginLeft: '4px', fontSize: '1rem' }} title="Verified Identity">✅</span>}
          </div>
          <div className="match-card__location">📍 {location}</div>
          {/* Trust Score & Rating */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px', flexWrap: 'wrap' }}>
            {trustScore > 0 && (
              <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                🛡️ {trustScore}/100
              </span>
            )}
            {totalReviews > 0 && (
              <span style={{ fontSize: '0.75rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                ⭐ {averageRating?.toFixed(1)} ({totalReviews})
              </span>
            )}
            {!totalReviews && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>New traveler</span>
            )}
          </div>
        </div>
        
        {/* Options Dropdown */}
        <div className="match-card__options" style={{ position: 'relative' }}>
          <button 
            className="btn-icon" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem' }}
            onClick={(e) => {
              const menu = e.currentTarget.nextElementSibling;
              menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            }}
          >
            ⋮
          </button>
          <div className="options-menu card" style={{ display: 'none', position: 'absolute', right: 0, top: '100%', zIndex: 10, minWidth: '120px', padding: '0.5rem 0' }}>
            <button 
              style={{ display: 'block', width: '100%', padding: '0.5rem 1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}
              onClick={() => onReportClick(match)}
            >
              🚩 Report
            </button>
            <button 
              style={{ display: 'block', width: '100%', padding: '0.5rem 1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', color: '#dc2626' }}
              onClick={() => onBlockClick(match)}
            >
              🚫 Block
            </button>
          </div>
        </div>
      </div>

      {/* Compat bar */}
      <CompatBar percentage={matchPercentage} />

      {/* Body */}
      <div className="match-card__body">
        {personalityType && (
          <div className="match-card__archetype">🧠 {personalityType}</div>
        )}
        {bio && <p className="match-card__bio">{bio}</p>}
        <div className="match-card__badges">
          {travelStyle && (
            <span className="match-badge match-badge--style">✈️ {travelStyle}</span>
          )}
          {budgetPreference && (
            <span className="match-badge">💰 {budgetPreference}</span>
          )}
        </div>
      </div>

      {/* Match Reasons */}
      {matchReasons?.length > 0 && (
        <div className="match-card__reasons">
          {matchReasons.map((r, i) => (
            <span key={i} className="reason-pill">{r}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="match-card__footer" style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
        <Link
          to={`/messages?user=${match._id}`}
          className="btn btn-primary"
          style={{ width: '100%', textAlign: 'center' }}
        >
          💬 Message {name?.split(' ')[0]}
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
            style={{ flex: 1, textAlign: 'center' }}
            onClick={() => onFollowToggle(match._id)}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button
            className="btn btn-outline"
            style={{ flex: 1, textAlign: 'center', color: '#f59e0b', borderColor: '#f59e0b' }}
            onClick={() => onReviewClick(match)}
          >
            ⭐ Review
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────
const BuddyFinder = () => {
  const { user, updateUser } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Safety Modals State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);

  const handleReviewClick = (match) => {
    setReviewTarget(match);
    setReviewModalOpen(true);
  };

  const handleReviewSuccess = () => {
    setSuccessMessage('⭐ Review submitted! Thank you for your feedback.');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleFollowToggle = async (targetUserId) => {
    try {
      const { data } = await API.post(`/auth/follow/${targetUserId}`);
      updateUser({ ...user, following: data.data.following });
    } catch (err) {
      console.error('Failed to toggle follow', err);
    }
  };

  const handleReportClick = (user) => {
    setSelectedUser(user);
    setReportModalOpen(true);
  };

  const handleBlockClick = (user) => {
    setSelectedUser(user);
    setBlockModalOpen(true);
  };

  const handleReportSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleBlockSuccess = (message, blockedId) => {
    setSuccessMessage(message);
    // Remove the blocked user from matches
    setMatches(matches.filter(m => m._id !== blockedId));
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const [styleFilter, setStyleFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState('');

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/matches', {
        params: { style: styleFilter, budget: budgetFilter, minScore: minScoreFilter }
      });
      setMatches(data.data);
    } catch (err) {
      setError('Failed to load matches. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [styleFilter, budgetFilter, minScoreFilter]);

  const isProfileIncomplete = !user?.travelStyle && !user?.personalityType;

  return (
    <div className="buddy-finder-page container">
      {/* Hero */}
      <div className="buddy-finder-hero">
        <h1>
          Find Your{' '}
          <span className="gradient-text">Travel Buddy</span> 🌍
        </h1>
        <p>
          We've matched you with travelers who share your style, budget, and
          personality. Find your perfect adventure partner!
        </p>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <select 
          value={styleFilter} 
          onChange={e => setStyleFilter(e.target.value)}
          style={{ flex: '1 1 200px', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
        >
          <option value="">All Travel Styles</option>
          <option value="Backpacking">Backpacking</option>
          <option value="Luxury">Luxury</option>
          <option value="Adventure">Adventure</option>
          <option value="Relaxation">Relaxation</option>
          <option value="Cultural">Cultural</option>
        </select>
        <select 
          value={budgetFilter} 
          onChange={e => setBudgetFilter(e.target.value)}
          style={{ flex: '1 1 200px', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
        >
          <option value="">All Budgets</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <select 
          value={minScoreFilter} 
          onChange={e => setMinScoreFilter(e.target.value)}
          style={{ flex: '1 1 200px', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
        >
          <option value="">Any Match %</option>
          <option value="50">50%+ Match</option>
          <option value="70">70%+ Match</option>
          <option value="90">90%+ Match</option>
        </select>
      </div>

      {/* Profile incomplete warning */}
      {isProfileIncomplete && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <strong style={{ color: '#d97706' }}>⚠️ Improve your matches!</strong>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
              Complete your profile and take the personality assessment to get better matches.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/profile/edit" className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
              Edit Profile
            </Link>
            <Link to="/assessment" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              Take Assessment
            </Link>
          </div>
        </div>
      )}

      {/* Success Message for Report/Block */}
      {successMessage && (
        <div className="card" style={{ backgroundColor: '#d1fae5', color: '#065f46', marginBottom: '2rem', padding: '1rem' }}>
          ✅ {successMessage}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="skeleton-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="buddy-empty">
          <div className="buddy-empty-icon">😕</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}

      {/* No matches */}
      {!loading && !error && matches.length === 0 && (
        <div className="buddy-empty">
          <div className="buddy-empty-icon">🔍</div>
          <h2>No matches found yet</h2>
          <p>
            There aren't enough users with completed profiles yet. Invite friends or complete your
            own profile to start seeing matches!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/profile/edit" className="btn btn-primary">
              Complete Your Profile
            </Link>
            <Link to="/assessment" className="btn btn-outline">
              Take Assessment
            </Link>
          </div>
        </div>
      )}

      {/* Match Results */}
      {!loading && !error && matches.length > 0 && (
        <>
          <div className="matches-meta">
            <p className="matches-count">
              Found <strong>{matches.length}</strong> compatible travel {matches.length === 1 ? 'buddy' : 'buddies'} for you
            </p>
          </div>
          <div className="matches-grid">
            {matches.map((match) => (
              <MatchCard 
                key={match._id} 
                match={match} 
                user={user} 
                onFollowToggle={handleFollowToggle} 
                onReportClick={handleReportClick}
                onBlockClick={handleBlockClick}
                onReviewClick={handleReviewClick}
              />
            ))}
          </div>
        </>
      )}

      {/* Safety Modals */}
      <ReportModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
        reportedUserId={selectedUser?._id}
        reportedUserName={selectedUser?.name}
        onReportSuccess={handleReportSuccess}
      />
      
      <BlockModal 
        isOpen={blockModalOpen} 
        onClose={() => setBlockModalOpen(false)} 
        blockedUserId={selectedUser?._id}
        blockedUserName={selectedUser?.name}
        onBlockSuccess={handleBlockSuccess}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        reviewee={reviewTarget}
        tripId={null}
        onReviewSuccess={handleReviewSuccess}
      />
    </div>
  );
};

export default BuddyFinder;
