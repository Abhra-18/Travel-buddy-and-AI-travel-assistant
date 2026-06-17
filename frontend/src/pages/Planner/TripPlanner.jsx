import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { getDestinationImage } from '../../utils/imageUtils';
import './Planner.css';

const stars = (n) => '⭐'.repeat(n);

const HotelCard = ({ hotel }) => (
  <div className="hotel-card">
    <div className="hotel-card__name">{hotel.name}</div>
    <div className="hotel-card__type">{hotel.hotelType || hotel.type}</div>
    <div className="hotel-stars">{stars(hotel.rating)}</div>
    <div className="hotel-card__price">
      ${hotel.pricePerNight} <span>/ night</span>
    </div>
    <div className="hotel-card__desc">{hotel.description}</div>
  </div>
);

const DayCard = ({ day }) => (
  <div className="day-card">
    <div className="day-card__header">
      <h3>Day {day.day} — {day.title}</h3>
      <span className="day-cost-badge">~${day.estimatedDayCost}/day</span>
    </div>
    <div className="day-card__body">
      <div className="day-timeline">
        <div className="timeline-item">
          <div className="timeline-dot">🌅</div>
          <div className="timeline-content">
            <div className="timeline-label">Morning</div>
            <div className="timeline-text">{day.morning}</div>
          </div>
        </div>
        <div className="timeline-item">
          <div className="timeline-dot">☀️</div>
          <div className="timeline-content">
            <div className="timeline-label">Afternoon</div>
            <div className="timeline-text">{day.afternoon}</div>
          </div>
        </div>
        <div className="timeline-item">
          <div className="timeline-dot">🌙</div>
          <div className="timeline-content">
            <div className="timeline-label">Evening</div>
            <div className="timeline-text">{day.evening}</div>
          </div>
        </div>
      </div>

      {day.attractions?.length > 0 && (
        <div className="day-tags">
          {day.attractions.map((a, i) => (
            <span key={i} className="day-tag">📍 {a}</span>
          ))}
        </div>
      )}
      {day.foodRecommendations?.length > 0 && (
        <div className="day-tags">
          {day.foodRecommendations.map((f, i) => (
            <span key={i} className="day-tag food">🍽️ {f}</span>
          ))}
        </div>
      )}
    </div>
  </div>
);

const TripPlanner = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ destination: '', numberOfDays: 3, budget: 'Moderate', travelStyle: '' });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setPlan(null);
    setLoading(true);
    try {
      const { data } = await API.post('/plans/generate', form);
      setPlan({ ...data.data, ...form });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.post('/plans/save', plan);
      navigate('/planner/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save plan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="planner-page container">
      {/* Hero */}
      <div className="planner-hero">
        <h1>🤖 AI <span className="gradient-text">Trip Planner</span></h1>
        <p>Enter your destination, budget and duration — get a complete personalized itinerary in seconds.</p>
      </div>

      {/* Input Form */}
      <div className="planner-input-card">
        <form onSubmit={handleGenerate}>
          <div className="planner-input-row">
            <input
              name="destination"
              value={form.destination}
              onChange={handleChange}
              placeholder="🌍 Destination (e.g. Bali, Paris, Tokyo)"
              required
            />
            <input
              type="number"
              name="numberOfDays"
              value={form.numberOfDays}
              onChange={handleChange}
              placeholder="Days"
              min={1}
              max={30}
              required
            />
            <select name="budget" value={form.budget} onChange={handleChange}>
              <option>Budget</option>
              <option>Moderate</option>
              <option>Luxury</option>
            </select>
          </div>
          <select name="travelStyle" value={form.travelStyle} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'inherit', marginBottom: '1rem', outline: 'none' }}>
            <option value="">Travel Style (optional)</option>
            <option>Backpacker</option>
            <option>Adventure</option>
            <option>Cultural</option>
            <option>Relaxation</option>
            <option>Luxury</option>
          </select>
          {error && <p style={{ color: '#ef4444', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{error}</p>}
          <button type="submit" className="btn btn-primary planner-generate-btn" disabled={loading}>
            {loading ? 'Generating...' : '✨ Generate My Itinerary'}
          </button>
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <div className="planner-loading">
          <div className="planner-loading-spinner" />
          <h3>Planning your trip...</h3>
          <p>Crafting the perfect itinerary for {form.destination} 🌏</p>
        </div>
      )}

      {/* Result */}
      {plan && !loading && (
        <div className="plan-result animate-fade-in-up">
          <div className="planner-hero-image" style={{ backgroundImage: `url(${getDestinationImage(plan.destination)})`, borderRadius: 'var(--radius-lg)', marginBottom: '2rem', marginTop: '2rem' }}>
            <div className="planner-hero-overlay">
              <div className="planner-hero-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📍 {plan.destination}</h2>
                  <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                    {plan.numberOfDays}-day {plan.budget} trip
                    {plan.bestTimeToVisit && ` · Best time: ${plan.bestTimeToVisit}`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-outline" style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff' }} onClick={() => { setPlan(null); }}>
                    ↺ Regenerate
                  </button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : '💾 Save Plan'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div className="plan-summary-row">
            <div className="plan-summary-card">
              <div className="summary-label">Duration</div>
              <div className="summary-value">{plan.numberOfDays} days</div>
            </div>
            <div className="plan-summary-card">
              <div className="summary-label">Budget</div>
              <div className="summary-value">{plan.budget}</div>
            </div>
            <div className="plan-summary-card">
              <div className="summary-label">Est. Total Cost</div>
              <div className="summary-value">${plan.totalEstimatedCost?.toLocaleString()}</div>
            </div>
            <div className="plan-summary-card">
              <div className="summary-label">Hotels</div>
              <div className="summary-value">{plan.hotelSuggestions?.length} Options</div>
            </div>
          </div>

          {/* Hotels */}
          {plan.hotelSuggestions?.length > 0 && (
            <>
              <div className="section-title">🏨 Hotel Suggestions</div>
              <div className="hotels-grid">
                {plan.hotelSuggestions.map((h, i) => <HotelCard key={i} hotel={h} />)}
              </div>
            </>
          )}

          {/* Itinerary */}
          <div className="section-title">🗓️ Day-by-Day Itinerary</div>
          <div className="itinerary-list">
            {plan.itinerary?.map((day) => <DayCard key={day.day} day={day} />)}
          </div>

          {/* Tips */}
          {plan.generalTips?.length > 0 && (
            <>
              <div className="section-title">💡 Travel Tips</div>
              <div className="tips-grid">
                {plan.generalTips.map((tip, i) => (
                  <div key={i} className="tip-item">
                    <span>✅</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Save CTA */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '0.9rem 2.5rem' }} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save This Plan to Dashboard'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPlanner;
