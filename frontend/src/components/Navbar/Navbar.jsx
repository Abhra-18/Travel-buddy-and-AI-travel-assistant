import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import useAuth from '../../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    closeMenu();
  };

  const navLinks = [];
  
  if (user) {
    if (user.role === 'admin') {
      navLinks.push({ label: 'Admin', to: '/admin' });
    }
    navLinks.push(
      { label: 'Feed', to: '/feed' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Trips', to: '/trips' },
      { label: 'Buddy Finder', to: '/buddy-finder' },
      { label: 'AI Planner', to: '/planner' },
      { label: 'Messages', to: '/messages' }
    );
  } else {
    navLinks.push(
      { label: 'Home', to: '/' },
      { label: 'Login', to: '/login' },
      { label: 'Register', to: '/register' }
    );
  }

  return (
    <nav id="main-navbar" className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" onClick={closeMenu}>
          <span className="navbar__logo-icon">✈️</span>
          <span className="navbar__logo-text">
            Travel<span className="gradient-text">Mate</span> AI
          </span>
        </Link>

        {/* Desktop Links */}
        <ul className="navbar__links">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right Side */}
        <div className="navbar__actions">
          <ThemeToggle />
          
          {user ? (
            <>
              <Link to="/profile" title="Profile" style={{ display: 'flex', alignItems: 'center' }}>
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-surface-alt)' }} />
                ) : (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', border: '2px solid var(--color-surface-alt)' }}>
                    {user.name?.charAt(0)}
                  </div>
                )}
              </Link>
              <button onClick={handleLogout} className="btn btn-outline navbar__cta">
                Logout
              </button>
            </>
          ) : (
            <Link to="/register" id="navbar-cta-btn" className="btn btn-primary navbar__cta">
              Get Started
            </Link>
          )}

          {/* Hamburger */}
          <button
            id="navbar-hamburger"
            className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`}>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`
            }
            onClick={closeMenu}
          >
            {link.label}
          </NavLink>
        ))}
        {user ? (
          <button onClick={handleLogout} className="btn btn-outline" style={{ marginTop: '1rem' }}>
            Logout
          </button>
        ) : (
          <Link to="/register" className="btn btn-primary" onClick={closeMenu}>
            Get Started
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
