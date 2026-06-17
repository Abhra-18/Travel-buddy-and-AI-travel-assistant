import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import useAuth from '../../hooks/useAuth';
import ReviewModal from '../../components/Reviews/ReviewModal';
import { getDestinationImage } from '../../utils/imageUtils';
import './Trips.css';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

const MemberAvatars = ({ members }) => (
  <div className="member-avatars">
    {members.slice(0, 4).map((m) =>
      m.profilePicture ? (
        <img key={m._id} src={m.profilePicture} alt={m.name} className="member-avatar" title={m.name} />
      ) : (
        <div key={m._id} className="member-avatar-placeholder" title={m.name}>
          {m.name?.charAt(0)}
        </div>
      )
    )}
    {members.length > 4 && (
      <div className="member-avatar-placeholder">+{members.length - 4}</div>
    )}
  </div>
);

const TripSkeleton = () => (
  <div className="trip-skeleton">
    <div className="trip-skeleton-banner" />
    <div className="trip-skeleton-body">
      <div className="trip-skeleton-line" />
      <div className="trip-skeleton-line trip-skeleton-line--medium" />
      <div className="trip-skeleton-line trip-skeleton-line--short" />
      <div className="trip-skeleton-line trip-skeleton-line--medium" />
      <div className="trip-skeleton-line" />
    </div>
  </div>
);

const TripCard = ({ trip, currentUserId, onJoin, onLeave, onDelete, onReviewClick }) => {
  const isMember = trip.members.some((m) => m._id === currentUserId);
  const isCreator = trip.creator._id === currentUserId;
  const isFull = trip.members.length >= trip.maxMembers;
  const spotsLeft = trip.maxMembers - trip.members.length;
  const fillPct = (trip.members.length / trip.maxMembers) * 100;
  const navigate = useNavigate();
  
  // Other members (excluding current user) that can be reviewed
  const reviewableMembers = trip.members.filter(m => m._id !== currentUserId);
  if (trip.creator._id !== currentUserId) {
    // Also include creator if they're not me
    const creatorIncluded = reviewableMembers.some(m => m._id === trip.creator._id);
    if (!creatorIncluded) reviewableMembers.push(trip.creator);
  }

  return (
    <div className="trip-card animate-fade-in-up">
      <div 
        className="trip-card__banner" 
        style={{ backgroundImage: `url(${getDestinationImage(trip.destination)})` }}
      />
      <div className="trip-card__body">
        <div className="trip-card__top">
          <div>
            <div className="trip-card__destination">📍 {trip.destination}</div>
            <div className="trip-card__title">{trip.title}</div>
          </div>
          <span className={`trip-status-badge ${trip.status.toLowerCase()}`}>{trip.status}</span>
        </div>

        <div className="trip-card__meta">
          <span className="trip-meta-item">📅 {formatDate(trip.startDate)} → {formatDate(trip.endDate)}</span>
          {trip.budget && <span className="trip-meta-item">💰 {trip.budget}</span>}
          {trip.travelStyle && <span className="trip-meta-item">✈️ {trip.travelStyle}</span>}
        </div>

        {trip.description && <p className="trip-card__desc">{trip.description}</p>}

        <div className="trip-card__members">
          <MemberAvatars members={trip.members} />
          <span className="trip-members-label">
            {trip.members.length}/{trip.maxMembers} members
            {!isFull && <> · <strong>{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</strong></>}
            {isFull && <> · <strong style={{ color: '#ef4444' }}>Full</strong></>}
          </span>
        </div>

        <div className="trip-spots-bar">
          <div className={`trip-spots-fill ${isFull ? 'full' : ''}`} style={{ width: `${fillPct}%` }} />
        </div>
      </div>

      <div className="trip-card__footer">
        <Link to={`/trips/${trip._id}`} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
          View
        </Link>
        {isCreator ? (
          <>
            <button className="btn btn-outline" style={{ fontSize: '0.85rem' }} onClick={() => navigate(`/trips/${trip._id}/edit`)}>
              Edit
            </button>
            <button className="btn" style={{ fontSize: '0.85rem', background: '#ef4444', color: '#fff' }} onClick={() => onDelete(trip._id)}>
              Delete
            </button>
            <Link to={`/messages?trip=${trip._id}`} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
              Chat 💬
            </Link>
          </>
        ) : isMember ? (
          <>
            <button className="btn btn-outline" style={{ fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444' }} onClick={() => onLeave(trip._id)}>
              Leave
            </button>
            <Link to={`/messages?trip=${trip._id}`} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
              Chat 💬
            </Link>
          </>
        ) : (
          <button className="btn btn-primary" style={{ fontSize: '0.85rem' }} onClick={() => onJoin(trip._id)} disabled={isFull}>
            {isFull ? 'Full' : 'Join Trip'}
          </button>
        )}
        
        {/* Review Buddy button — only visible if you're a member and there are others to review */}
        {(isMember || isCreator) && reviewableMembers.length > 0 && (
          <button
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', color: '#f59e0b', borderColor: '#f59e0b' }}
            onClick={() => onReviewClick(trip, reviewableMembers)}
          >
            ⭐ Review
          </button>
        )}
      </div>
    </div>
  );
};

const TripExplorer = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const navigate = useNavigate();

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const searchTimeout = useRef(null);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTrip, setReviewTrip] = useState(null);
  const [reviewMember, setReviewMember] = useState(null);
  const [pickMemberOpen, setPickMemberOpen] = useState(false);
  const [pickMemberList, setPickMemberList] = useState([]);
  const [reviewSuccess, setReviewSuccess] = useState('');

  const handleReviewClick = (trip, members) => {
    setReviewTrip(trip);
    if (members.length === 1) {
      setReviewMember(members[0]);
      setReviewModalOpen(true);
    } else {
      setPickMemberList(members);
      setPickMemberOpen(true);
    }
  };

  const handleReviewSuccess = () => {
    setReviewSuccess('Review submitted successfully! 🌟');
    setTimeout(() => setReviewSuccess(''), 5000);
  };

  const fetchTrips = useCallback(async (pageNum = 1, replace = true) => {
    if (replace) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const params = {
        page: pageNum,
        limit: 12,
        search,
        status: statusFilter,
        style: styleFilter,
        budget: budgetFilter
      };

      const [allRes, myRes] = await Promise.all([
        API.get('/trips', { params }),
        API.get('/trips/my') // My trips usually don't need heavy pagination for a single user, but can be added if needed
      ]);
      
      const newTrips = allRes.data.data || [];
      setTrips(prev => replace ? newTrips : [...prev, ...newTrips]);
      setHasMore(allRes.data.page < allRes.data.totalPages);
      
      if (replace) {
        setMyTrips(myRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, statusFilter, styleFilter, budgetFilter]);

  useEffect(() => {
    setPage(1);
    fetchTrips(1, true);
  }, [fetchTrips]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(val), 350);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTrips(nextPage, false);
  };

  const handleJoin = async (id) => {
    try {
      await API.post(`/trips/${id}/join`);
      fetchTrips(1, true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join trip.');
    }
  };

  const handleLeave = async (id) => {
    if (!window.confirm('Are you sure you want to leave this trip?')) return;
    try {
      await API.post(`/trips/${id}/leave`);
      fetchTrips(1, true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave trip.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip? This cannot be undone.')) return;
    try {
      await API.delete(`/trips/${id}`);
      fetchTrips(1, true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete trip.');
    }
  };

  const displayedTrips = tab === 'all' ? trips : myTrips;

  return (
    <div className="trip-explorer-page container">
      <div className="trip-hero">
        <h1>
          Explore <span className="gradient-text">Trips</span> 🗺️
        </h1>
        <p>Browse open trips, join an adventure, or create your own.</p>
      </div>

      <div className="trip-explorer-actions">
        <div className="trip-tabs">
          <button className={`trip-tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
            All Trips
          </button>
          <button className={`trip-tab ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')}>
            My Trips
          </button>
        </div>
        <Link to="/trips/new" className="btn btn-primary">+ Create Trip</Link>
      </div>

      {tab === 'all' && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="🔍 Search destination or title..."
            value={searchInput}
            onChange={handleSearchChange}
            style={{
              flex: '1 1 250px',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          />
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
          >
            <option value="">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
          <select 
            value={styleFilter} 
            onChange={e => setStyleFilter(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
          >
            <option value="">All Styles</option>
            <option value="Backpacking">Backpacking</option>
            <option value="Luxury">Luxury</option>
            <option value="Adventure">Adventure</option>
            <option value="Relaxation">Relaxation</option>
            <option value="Cultural">Cultural</option>
          </select>
          <select 
            value={budgetFilter} 
            onChange={e => setBudgetFilter(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
          >
            <option value="">All Budgets</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      )}
      {loading && (
        <div className="trips-grid">
          {[1,2,3,4,5,6].map((i) => <TripSkeleton key={i} />)}
        </div>
      )}

      {!loading && displayedTrips.length === 0 && (
        <div className="trip-empty">
          <div className="trip-empty-icon">{tab === 'my' ? '🧳' : '🌍'}</div>
          <h2>{tab === 'my' ? 'No trips yet!' : 'No trips available'}</h2>
          <p>{tab === 'my' ? "You haven't created or joined any trips yet." : (search || statusFilter || styleFilter || budgetFilter) ? 'Try adjusting your filters.' : 'Be the first to create one!'}</p>
          <Link to="/trips/new" className="btn btn-primary">Create a Trip</Link>
        </div>
      )}

      {!loading && displayedTrips.length > 0 && (
        <>
          <div className="trips-grid staggered-grid">
            {displayedTrips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                currentUserId={user?._id}
                onJoin={handleJoin}
                onLeave={handleLeave}
                onDelete={handleDelete}
                onReviewClick={handleReviewClick}
              />
            ))}
          </div>
          {/* Load More Pagination */}
          {tab === 'all' && hasMore && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button
                className="btn btn-outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                style={{ minWidth: '160px' }}
              >
                {loadingMore ? 'Loading...' : 'Load More Trips'}
              </button>
            </div>
          )}
          {tab === 'all' && !hasMore && displayedTrips.length > 0 && (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '3rem', fontSize: '0.9rem' }}>
              You've seen all the trips 🗺️
            </p>
          )}
        </>
      )}

      {/* Review success banner */}
      {reviewSuccess && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#d1fae5', color: '#065f46', padding: '1rem 1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 9999, fontWeight: 600 }}>
          {reviewSuccess}
        </div>
      )}

      {/* Pick Member modal — shown when trip has multiple reviewable members */}
      {pickMemberOpen && (
        <div className="modal-overlay" onClick={() => setPickMemberOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '400px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPickMemberOpen(false)}>&times;</button>
            <h2 style={{ marginBottom: '1.5rem' }}>Who do you want to review?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pickMemberList.map(member => (
                <button
                  key={member._id}
                  className="btn btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem' }}
                  onClick={() => {
                    setReviewMember(member);
                    setPickMemberOpen(false);
                    setReviewModalOpen(true);
                  }}
                >
                  {member.profilePicture
                    ? <img src={member.profilePicture} alt={member.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                    : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{member.name?.charAt(0)}</div>
                  }
                  <span>{member.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        reviewee={reviewMember}
        tripId={reviewTrip?._id}
        onReviewSuccess={handleReviewSuccess}
      />
    </div>
  );
};

export default TripExplorer;
