import { useState } from 'react';
import API from '../../services/api';

const backdropStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem',
};

const modalStyle = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-xl)',
  padding: '2rem',
  width: '100%',
  maxWidth: '480px',
  position: 'relative',
  boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
  border: '1px solid var(--color-border)',
};

const ReviewModal = ({ isOpen, onClose, reviewee, tripId, onReviewSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !reviewee) return null;

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setComment('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a review comment');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await API.post('/reviews', {
        revieweeId: reviewee._id,
        tripId,
        rating,
        comment,
      });
      setLoading(false);
      onReviewSuccess();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
      setLoading(false);
    }
  };

  return (
    <div style={backdropStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-secondary)', lineHeight: 1 }}
        >
          &times;
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          {reviewee.profilePicture
            ? <img src={reviewee.profilePicture} alt={reviewee.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
            : <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}>{reviewee.name?.charAt(0)}</div>
          }
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Review {reviewee.name}</h2>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>How was your experience travelling together?</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Select a rating</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    fontSize: '2.5rem',
                    cursor: 'pointer',
                    color: star <= (hoverRating || rating) ? '#f59e0b' : 'var(--color-border)',
                    transition: 'color 0.15s, transform 0.1s',
                    transform: star <= (hoverRating || rating) ? 'scale(1.15)' : 'scale(1)',
                    display: 'inline-block',
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
            {rating > 0 && (
              <p style={{ fontSize: '0.85rem', color: '#f59e0b', marginTop: '0.5rem', fontWeight: 600 }}>
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '1.5rem' }}>
            <textarea
              placeholder={`Tell others what it was like travelling with ${reviewee.name}...`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-alt)',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              {comment.length}/500
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={handleClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : '⭐ Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
