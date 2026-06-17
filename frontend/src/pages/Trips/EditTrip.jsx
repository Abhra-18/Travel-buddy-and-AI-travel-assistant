import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import useAuth from '../../hooks/useAuth';
import './Trips.css';

const formatDateInput = (d) => new Date(d).toISOString().split('T')[0];

const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/trips/${id}`);
        const t = data.data;
        if (t.creator._id !== user?._id) {
          navigate('/trips');
          return;
        }
        setForm({
          title: t.title,
          destination: t.destination,
          description: t.description,
          startDate: formatDateInput(t.startDate),
          endDate: formatDateInput(t.endDate),
          budget: t.budget,
          budgetAmount: t.budgetAmount,
          maxMembers: t.maxMembers,
          travelStyle: t.travelStyle,
          status: t.status,
          isPublic: t.isPublic,
        });
      } catch {
        navigate('/trips');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await API.put(`/trips/${id}`, form);
      navigate('/trips');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update trip.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading…</div>;

  return (
    <div className="trip-form-page container">
      <h1>✏️ Edit Trip</h1>
      <div className="trip-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Trip Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Destination *</label>
            <input name="destination" value={form.destination} onChange={handleChange} required />
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
              <input type="number" name="budgetAmount" value={form.budgetAmount} onChange={handleChange} min="0" />
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
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option>Planning</option>
              <option>Ongoing</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} />
          </div>
          {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
          <div className="form-actions">
            <Link to="/trips" className="btn btn-outline">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTrip;
