import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Recycle, 
  Search, 
  PlusCircle, 
  Heart, 
  MessageSquare, 
  User, 
  Layers, 
  Cpu, 
  Leaf,
  Menu,
  X,
  Package,
  LogOut,
  ChevronDown,
  Shield,
  Clock,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import '../styles/components.css';

export default function Navbar() {
  const { wishlist, user, setActiveChatListing, listings, logout, theme, toggleTheme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route navigation
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  const openSampleChat = () => {
    if (listings.length > 0) {
      setActiveChatListing(listings[0]);
    }
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="site-header">
      {/* Top micro-announcement banner */}
      <div className="site-header__notice">
        <div className="site-header__notice-inner">
          <div className="site-header__notice-message">
            <span className="site-header__live-indicator">
              <span className="site-header__live-pulse"></span>
              <span className="site-header__live-dot"></span>
            </span>
            <span>Escrow Protected Marketplace: Funds are held safely until delivery & inspection</span>
          </div>
          <div className="site-header__notice-links">
            <Link to="/impact" className="site-header__notice-link">
              <Leaf className="site-header__icon site-header__icon--notice" />
              <span>UN E-Waste Guidelines Compliant</span>
            </Link>
            <Link to="/recycle" className="site-header__notice-link">
              <Recycle className="site-header__icon site-header__icon--notice" />
              <span>Certified Recycler Hubs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="site-header__container">
        <div className="site-header__main">
          
          {/* Logo */}
          <Link to="/" className="site-header__brand">
            <div className="site-header__brand-mark">
              <Recycle className="site-header__brand-icon" />
            </div>
            <div>
              <span className="site-header__brand-name">
                Re<span className="site-header__brand-accent">Tech</span>
              </span>
              <span className="site-header__brand-caption">
                Circular Market
              </span>
            </div>
          </Link>

          {/* Quick Category / Mode Links (Desktop) */}
          <nav className="site-header__desktop-nav">
            <Link 
              to="/browse" 
              className={`site-header__nav-link ${location.pathname === '/browse' ? 'is-active' : ''}`}
            >
              Browse All
            </Link>
            <Link 
              to="/recycle" 
              className="site-header__nav-link site-header__nav-link--recyclers"
            >
              <Recycle className="site-header__icon site-header__icon--eco" />
              <span>Recyclers</span>
            </Link>
          </nav>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="site-header__desktop-search">
            <div className="site-header__search-wrap">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search MacBook, RTX 3080, DDR5, broken iPads..."
                className="site-header__search-input"
              />
              <Search className="site-header__search-icon" />
            </div>
          </form>

          {/* Action CTAs */}
          <div className="site-header__actions">
            
            {/* Wishlist */}
            <Link
              to="/dashboard?tab=wishlist"
              className="site-header__action"
              title="Wishlist"
            >
              <Heart className="site-header__action-icon" />
              {wishlist.length > 0 && (
                <span className="site-header__count site-header__count--wishlist">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Messages */}
            <Link
              to="/messages"
              className="site-header__action"
              title="Messages & Chat"
            >
              <MessageSquare className="site-header__action-icon" />
            </Link>

            {/* Theme Toggle (Light / Dark Mode) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="site-header__action site-header__action--theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Light and Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun className="site-header__action-icon" style={{ color: '#f59e0b' }} />
              ) : (
                <Moon className="site-header__action-icon" />
              )}
            </button>

            {/* Sell Button CTA */}
            <Link
              to="/sell"
              className="site-header__sell-button"
            >
              <PlusCircle className="site-header__sell-icon" />
              <span className="site-header__sell-label site-header__sell-label--full">Sell an Item</span>
              <span className="site-header__sell-label site-header__sell-label--short">Sell</span>
            </Link>

            {/* User Profile Dropdown or Auth Links */}
            {user ? (
              <div className="site-header__profile-wrap" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="site-header__profile-button"
                  aria-label="User Account Menu"
                >
                  <div className="site-header__profile-avatar-wrap">
                    <img src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={user.name} className="site-header__profile-avatar" />
                  </div>
                  <div className="site-header__profile-copy">
                    <p className="site-header__profile-name">{user.name?.split(' ')[0]}</p>
                    <p className="site-header__profile-impact">
                      {user.totalKgDiverted || 0} kg diverted
                    </p>
                  </div>
                  <ChevronDown className={`site-header__chevron ${userMenuOpen ? 'is-open' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="site-header__profile-menu">
                    {/* User Info Header */}
                    <div className="site-header__profile-menu-header">
                      <div className="site-header__profile-summary">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={user.name}
                          className="site-header__profile-menu-avatar"
                        />
                        <div className="site-header__profile-details">
                          <p className="site-header__profile-full-name">{user.name}</p>
                          <p className="site-header__profile-email">{user.email}</p>
                        </div>
                      </div>
                      <div className="site-header__impact-summary">
                        <span>Circular Impact</span>
                        <span className="site-header__impact-value">{user.totalKgDiverted || 0} kg diverted</span>
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="site-header__profile-links">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="site-header__profile-link"
                      >
                        <User className="site-header__profile-link-icon" />
                        <span>My Dashboard & Profile</span>
                      </Link>
                      <Link
                        to="/dashboard?tab=listings"
                        onClick={() => setUserMenuOpen(false)}
                        className="site-header__profile-link"
                      >
                        <Package className="site-header__profile-link-icon" />
                        <span>My Listings</span>
                      </Link>
                      <Link
                        to="/dashboard?tab=orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="site-header__profile-link"
                      >
                        <Clock className="site-header__profile-link-icon" />
                        <span>Orders & Escrow</span>
                      </Link>
                      <Link
                        to="/messages"
                        onClick={() => setUserMenuOpen(false)}
                        className="site-header__profile-link"
                      >
                        <MessageSquare className="site-header__profile-link-icon" />
                        <span>Messages & Inbox</span>
                      </Link>
                      <Link
                        to="/dashboard?tab=wishlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="site-header__profile-link"
                      >
                        <Heart className="site-header__profile-link-icon" />
                        <span>Saved Wishlist ({wishlist.length})</span>
                      </Link>

                      {/* Theme Toggle in Profile Menu */}
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="site-header__profile-link"
                      >
                        {theme === 'dark' ? (
                          <Sun className="site-header__profile-link-icon" style={{ color: '#f59e0b' }} />
                        ) : (
                          <Moon className="site-header__profile-link-icon" />
                        )}
                        <span>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                      </button>

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="site-header__profile-link site-header__profile-link--admin"
                        >
                          <Shield className="site-header__profile-link-icon site-header__profile-link-icon--admin" />
                          <span>Admin Moderation Console</span>
                        </Link>
                      )}
                    </div>

                    {/* Sign Out Action */}
                    <div className="site-header__logout-wrap">
                      <button
                        onClick={handleLogout}
                        className="site-header__logout"
                      >
                        <LogOut className="site-header__profile-link-icon" />
                        <span>Sign Out / Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="site-header__auth-links">
                <Link
                  to="/login"
                  className="site-header__sign-in"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="site-header__sign-up"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="site-header__mobile-toggle"
            >
              {mobileMenuOpen ? <X className="site-header__toggle-icon" /> : <Menu className="site-header__toggle-icon" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="site-header__mobile-search">
          <form onSubmit={handleSearchSubmit}>
            <div className="site-header__search-wrap">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search MacBook, GPUs, parts..."
                className="site-header__search-input site-header__search-input--mobile"
              />
              <Search className="site-header__search-icon" />
            </div>
          </form>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="site-header__mobile-menu">
            <Link 
              to="/browse" 
              onClick={() => setMobileMenuOpen(false)}
              className="site-header__mobile-link"
            >
              Browse All Electronics
            </Link>
            <Link 
              to="/dashboard" 
              onClick={() => setMobileMenuOpen(false)}
              className="site-header__mobile-link"
            >
              Seller Dashboard & Orders
            </Link>
            <Link 
              to="/messages" 
              onClick={() => setMobileMenuOpen(false)}
              className="site-header__mobile-link"
            >
              Messages & Chat
            </Link>
            <Link 
              to="/impact" 
              onClick={() => setMobileMenuOpen(false)}
              className="site-header__mobile-link site-header__mobile-link--eco"
            >
              E-Waste Impact Tracker & Methodology
            </Link>
            <Link 
              to="/recycle" 
              onClick={() => setMobileMenuOpen(false)}
              className="site-header__mobile-link"
            >
              Authorized Recycler Directory
            </Link>

            {/* Mobile Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="site-header__mobile-link"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', textAlign: 'left', background: 'transparent', border: 0 }}
            >
              {theme === 'dark' ? (
                <Sun size={18} style={{ color: '#f59e0b' }} />
              ) : (
                <Moon size={18} />
              )}
              <span>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
            </button>

            {/* Mobile Auth options */}
            <div className="site-header__mobile-account">
              {user ? (
                <div className="site-header__mobile-account-content">
                  <div className="site-header__mobile-user">
                    <img src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={user.name} className="site-header__mobile-user-avatar" />
                    <div>
                      <p className="site-header__mobile-user-name">{user.name}</p>
                      <p className="site-header__mobile-user-email">{user.email}</p>
                    </div>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="site-header__mobile-admin"
                    >
                      Admin Moderation Console →
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="site-header__mobile-logout"
                  >
                    <LogOut className="site-header__profile-link-icon" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="site-header__mobile-auth">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="site-header__mobile-auth-link"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="site-header__mobile-auth-link site-header__mobile-auth-link--primary"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
