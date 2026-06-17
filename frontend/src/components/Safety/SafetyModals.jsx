import { useState } from 'react';
import API from '../../services/api';

export const ReportModal = ({ isOpen, onClose, reportedUserId, reportedUserName, onReportSuccess }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await API.post(`/safety/report/${reportedUserId}`, { reason, description });
      onReportSuccess(data.message);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" style={backdropStyle}>
      <div className="card" style={modalStyle}>
        <h3>Report {reportedUserName}</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Please tell us why you are reporting this user.
        </p>
        
        {error && <div style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Reason *</label>
            <select className="form-input" value={reason} onChange={(e) => setReason(e.target.value)} required>
              <option value="">Select a reason</option>
              <option value="Harassment">Harassment or Bullying</option>
              <option value="Fake Profile">Fake Profile / Spam</option>
              <option value="Inappropriate Content">Inappropriate Content</option>
              <option value="Scam or Fraud">Scam or Fraud</option>
              <option value="Threatening Behavior">Threatening Behavior</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea 
              className="form-input" 
              rows="3" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details to help us investigate..."
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#dc2626', color: 'white', border: 'none' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const BlockModal = ({ isOpen, onClose, blockedUserId, blockedUserName, onBlockSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleBlock = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await API.post(`/safety/block/${blockedUserId}`);
      onBlockSuccess(data.message, blockedUserId);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to block user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" style={backdropStyle}>
      <div className="card" style={modalStyle}>
        <h3>Block {blockedUserName}?</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '1rem 0' }}>
          They won't be able to find your profile, see your posts, or message you on Travel Buddy. They won't be notified that you blocked them.
        </p>
        
        {error && <div style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="btn btn-primary" style={{ backgroundColor: '#dc2626', color: 'white', border: 'none' }} onClick={handleBlock} disabled={loading}>
            {loading ? 'Blocking...' : 'Block User'}
          </button>
        </div>
      </div>
    </div>
  );
};

const backdropStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  padding: '1rem'
};

const modalStyle = {
  width: '100%',
  maxWidth: '400px',
  maxHeight: '90vh',
  overflowY: 'auto'
};
