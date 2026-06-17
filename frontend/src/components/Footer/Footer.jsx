import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer id="main-footer" className="footer">
      <div className="container footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <span>✈️</span>
            <span>
              Travel<span className="gradient-text">Mate</span> AI
            </span>
          </Link>
          <p className="footer__tagline">
            Your AI-powered travel companion. Plan smarter, explore further.
          </p>
        </div>

        {/* Links */}
        <div className="footer__links-group">
          <h4 className="footer__heading">Navigation</h4>
          <ul className="footer__links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </div>

        <div className="footer__links-group">
          <h4 className="footer__heading">Legal</h4>
          <ul className="footer__links">
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="container">
          <p>© {year} TravelMate AI. All rights reserved.</p>
          <p>Built with ❤️ and React</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
