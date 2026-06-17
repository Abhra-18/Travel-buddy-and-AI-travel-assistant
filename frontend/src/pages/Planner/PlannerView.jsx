import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

const PlannerView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const { data } = await API.get(`/plans/${id}`);
        setPlan(data.data);
      } catch (err) {
        console.error(err);
        navigate('/planner/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="planner-page container">
        <div className="planner-loading">
          <div className="planner-loading-spinner" />
          <h3>Loading your plan...</h3>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="planner-page animate-fade-in-up">
      <div className="planner-hero-image" style={{ backgroundImage: `url(${getDestinationImage(plan.destination)})` }}>
        <div className="planner-hero-overlay container">
          <Link to="/planner/dashboard" className="btn btn-outline planner-back-btn">
            ← Back to Dashboard
          </Link>
          <div className="planner-hero-content">
            <h2>📍 {plan.destination}</h2>
            <p>
              {plan.numberOfDays}-day {plan.budget} trip
              {plan.bestTimeToVisit && ` · Best time: ${plan.bestTimeToVisit}`}
            </p>
          </div>
        </div>
      </div>

      <div className="plan-result container" style={{ marginTop: '3rem' }}>
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
      </div>
    </div>
  );
};

export default PlannerView;
