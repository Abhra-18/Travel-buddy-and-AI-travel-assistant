import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import './Planner.css';

const PlannerDashboard = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/plans');
      setPlans(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this saved plan?')) return;
    try {
      await API.delete(`/plans/${id}`);
      fetchPlans();
    } catch (err) {
      alert('Failed to delete plan.');
    }
  };

  return (
    <div className="planner-dashboard container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>
            🗺️ My <span className="gradient-text">Trip Plans</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
            All your saved AI-generated itineraries in one place.
          </p>
        </div>
        <Link to="/planner" className="btn btn-primary">+ New Plan</Link>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <div className="planner-loading-spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Loading your plans...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && plans.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🧳</div>
          <h2 style={{ marginBottom: '0.75rem' }}>No saved plans yet</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            Use the AI Trip Planner to generate and save your first itinerary!
          </p>
          <Link to="/planner" className="btn btn-primary">Create My First Plan</Link>
        </div>
      )}

      {/* Plans Grid */}
      {!loading && plans.length > 0 && (
        <div className="plans-grid">
          {plans.map((plan) => (
            <div className="plan-card" key={plan._id}>
              <div className="plan-card__top">
                <div className="plan-card__destination">📍 {plan.destination}</div>
                <div className="plan-card__meta">
                  {plan.numberOfDays} days · {plan.budget}
                  {plan.aiGenerated && ' · ✨ AI Generated'}
                </div>
              </div>
              <div className="plan-card__body">
                <div className="plan-card__stats">
                  <div className="plan-stat">
                    <span className="plan-stat-label">Est. Cost</span>
                    <span className="plan-stat-value">${plan.totalEstimatedCost?.toLocaleString()}</span>
                  </div>
                  <div className="plan-stat">
                    <span className="plan-stat-label">Hotels</span>
                    <span className="plan-stat-value">{plan.hotelSuggestions?.length || 0} options</span>
                  </div>
                  <div className="plan-stat">
                    <span className="plan-stat-label">Itinerary</span>
                    <span className="plan-stat-value">{plan.itinerary?.length || 0} days</span>
                  </div>
                </div>
                {plan.bestTimeToVisit && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    📅 Best time: {plan.bestTimeToVisit}
                  </p>
                )}
              </div>
              <div className="plan-card__footer">
                <button
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => navigate(`/planner/view/${plan._id}`)}
                >
                  View Plan
                </button>
                <button
                  className="btn"
                  style={{ fontSize: '0.85rem', background: '#ef4444', color: '#fff' }}
                  onClick={() => handleDelete(plan._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlannerDashboard;
