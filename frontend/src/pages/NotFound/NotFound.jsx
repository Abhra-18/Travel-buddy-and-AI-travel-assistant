import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div id="not-found-page" className="not-found">
      <div className="not-found__content">
        <span className="not-found__emoji">🗺️</span>
        <h1 className="not-found__code gradient-text">404</h1>
        <h2 className="not-found__title">Page Not Found</h2>
        <p className="not-found__message">
          Looks like you've wandered off the map. This destination doesn't exist!
        </p>
        <Link to="/" id="not-found-home-btn" className="btn btn-primary">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
