import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import './Trips.css';

const CreateTrip = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    destination: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    budgetAmount: '',
    maxMembers: 4,
    travelStyle: '',
    isPublic: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/trips', form);
      if (data.success) {
        navigate('/trips');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trip-form-page container">
      <h1>🧳 Create a New Trip</h1>
      <div className="trip-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Trip Title *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Backpacking Bali 2025" required />
          </div>

          <div className="form-group">
            <label>Destination *</label>
            <input name="destination" value={form.destination} onChange={handleChange} placeholder="e.g. Bali, Indonesia" required />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Start Date *</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>End Date *</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Budget Type</label>
              <select name="budget" value={form.budget} onChange={handleChange}>
                <option value="">Select budget</option>
                <option>Budget</option>
                <option>Moderate</option>
                <option>Luxury</option>
              </select>
            </div>
            <div className="form-group">
              <label>Estimated Budget (USD)</label>
              <input type="number" name="budgetAmount" value={form.budgetAmount} onChange={handleChange} placeholder="e.g. 1500" min="0" />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Travel Style</label>
              <select name="travelStyle" value={form.travelStyle} onChange={handleChange}>
                <option value="">Select style</option>
                <option>Backpacker</option>
                <option>Luxury</option>
                <option>Adventure</option>
                <option>Relaxation</option>
                <option>Cultural</option>
                <option>Business</option>
              </select>
            </div>
            <div className="form-group">
              <label>Max Members</label>
              <input type="number" name="maxMembers" value={form.maxMembers} onChange={handleChange} min="1" max="20" />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Tell others about this trip — plans, vibe, what to expect..." />
          </div>

          {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

          <div className="form-actions">
            <Link to="/trips" className="btn btn-outline">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Trip 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;
