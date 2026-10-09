import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  CheckCircle2,
  Shield,
  ArrowRight,
  Globe,
  Recycle,
  Leaf,
  Cpu,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import '../styles/pages.css';

// Shared Left-Side Branding & Objects Component
function AuthBrandShowcase() {
  return (
    <div className="auth-brand">
      {/* Top: Logo and Tagline */}
      <div className="auth-brand__top">
        <Link to="/" className="auth-brand__logo">
          <div className="auth-brand__mark">
            <Recycle className="auth-brand__mark-icon" />
          </div>
          <div>
            <span className="auth-brand__name">
              Re<span className="auth-brand__name-accent">Tech</span>
            </span>
            <span className="auth-brand__caption">
              Circular Market
            </span>
          </div>
        </Link>

        <div className="auth-brand__message">
          <span className="auth-brand__badge">
            <Sparkles className="auth-icon auth-icon--small" />
            Verified Pre-Owned Electronics & PC Hardware
          </span>
          <h2 className="auth-brand__headline">
            Keep electronics in circulation. Spare landfills. Save money.
          </h2>
          <p className="auth-brand__description">
            ReTech is the trusted platform uniting eco-conscious buyers, sellers, and hardware repairers with automated escrow protection.
          </p>
        </div>
      </div>

      {/* Middle: The Core Objects / Value Pillars of ReTech */}
      <div className="auth-brand__pillars">
        <p className="auth-brand__pillars-heading">
          Core Platform Pillars
        </p>

        <div className="auth-brand__pillar-list">
          {/* Object 1: Escrow Protection */}
          <div className="auth-brand__pillar">
            <div className="auth-brand__pillar-icon auth-brand__pillar-icon--blue">
              <ShieldCheck className="auth-icon auth-icon--medium" />
            </div>
            <div>
              <h3 className="auth-brand__pillar-title">100% Escrow Protection</h3>
              <p className="auth-brand__pillar-copy">
                Buyer funds are held in secure escrow until you inspect hardware upon delivery.
              </p>
            </div>
          </div>

          {/* Object 2: Circular E-Waste Diversion */}
          <div className="auth-brand__pillar">
            <div className="auth-brand__pillar-icon auth-brand__pillar-icon--eco">
              <Leaf className="auth-icon auth-icon--medium" />
            </div>
            <div>
              <h3 className="auth-brand__pillar-title">LCA E-Waste & Carbon Tracking</h3>
              <p className="auth-brand__pillar-copy">
                Every listing quantifies kilograms of diverted e-waste and embodied CO₂ emissions spared.
              </p>
            </div>
          </div>

          {/* Object 3: PC Components & Salvage */}
          <div className="auth-brand__pillar">
            <div className="auth-brand__pillar-icon auth-brand__pillar-icon--purple">
              <Cpu className="auth-icon auth-icon--medium" />
            </div>
            <div>
              <h3 className="auth-brand__pillar-title">Component Salvage & Repair Hub</h3>
              <p className="auth-brand__pillar-copy">
                Trade verified laptops, GPUs, motherboards, or broken devices under "For Parts".
              </p>
            </div>
          </div>

          {/* Object 4: Certified Recycler Network */}
          <div className="auth-brand__pillar">
            <div className="auth-brand__pillar-icon auth-brand__pillar-icon--amber">
              <Recycle className="auth-icon auth-icon--medium" />
            </div>
            <div>
              <h3 className="auth-brand__pillar-title">Certified Recycler Hubs</h3>
              <p className="auth-brand__pillar-copy">
                Free directory of CPCB & R2 certified e-waste facilities for dead batteries and PCBs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Community Impact Metric Badge */}
      <div className="auth-brand__footer">
        <span>🌱 Over 4,800+ kg e-waste diverted</span>
        <span className="auth-brand__footer-emphasis">100% Escrow Verified</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sign In Page (LoginPage)
// ─────────────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back to ReTech!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@retechmarket.com');
    setPassword('Admin@1234');
    toast('Filled Demo Admin credentials', { icon: '🔑' });
  };

  return (
    <div className="auth-page">
      {/* Left side: Brand, Logo, Mission & Objects */}
      <div className="auth-page__brand-column">
        <AuthBrandShowcase />
      </div>

      {/* Right side: Sign In Form Box */}
      <div className="auth-page__form-column">
        <div className="auth-card">

          <div className="auth-card__header auth-card__header--spacious">
            <div className="auth-card__mark">
              <Lock className="auth-icon auth-icon--large" />
            </div>
            <h1 className="auth-card__title">
              Sign In to ReTech
            </h1>
            <p className="auth-card__summary">
              Access your hardware listings, escrow chats, and orders
            </p>
          </div>

          <form onSubmit={handleLogin} className="auth-form auth-form--spacious">
            <div>
              <label className="auth-form__label">
                Email Address
              </label>
              <div className="auth-form__input-wrap">
                <Mail className="auth-form__input-icon" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="auth-form__input"
                />
              </div>
            </div>

            <div>
              <div className="auth-form__label-row">
                <label className="auth-form__label">
                  Password
                </label>
              </div>
              <div className="auth-form__input-wrap">
                <Lock className="auth-form__input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-form__input auth-form__input--password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-form__password-toggle"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="auth-icon auth-icon--small" /> : <Eye className="auth-icon auth-icon--small" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-form__submit"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="auth-icon auth-icon--small" />
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="auth-card__demo">
            <span>Testing the platform?</span>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="auth-text-link"
            >
              Use Admin Account
            </button>
          </div>

          <div className="auth-card__footer">
            Don't have an account?{' '}
            <Link to="/register" className="auth-text-link auth-text-link--bold">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sign Up Page (RegisterPage)
// ─────────────────────────────────────────────────────────────────────────────
export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('India');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useApp();
  const navigate = useNavigate();

  const countries = [
    'India',
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'United Arab Emirates',
    'Singapore',
    'France',
    'Japan',
    'Netherlands',
    'Other',
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password, country);
      toast.success('Registration successful! Please sign in with your credentials.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left side: Brand, Logo, Mission & Objects */}
      <div className="auth-page__brand-column">
        <AuthBrandShowcase />
      </div>

      {/* Right side: Sign Up Form Box */}
      <div className="auth-page__form-column">
        <div className="auth-card">

          <div className="auth-card__header">
            <div className="auth-card__mark auth-card__mark--verified">
              <Shield className="auth-icon auth-icon--large" />
            </div>
            <h1 className="auth-card__title">
              Create your Account
            </h1>
            <p className="auth-card__summary">
              Join ReTech to trade verified electronics with 100% escrow protection
            </p>
          </div>

          <form onSubmit={handleRegister} className="auth-form">
            {/* Full Name */}
            <div>
              <label className="auth-form__label">
                Full Name
              </label>
              <div className="auth-form__input-wrap">
                <User className="auth-form__input-icon" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jayesh Patel"
                  className="auth-form__input auth-form__input--compact"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="auth-form__label">
                Email Address
              </label>
              <div className="auth-form__input-wrap">
                <Mail className="auth-form__input-icon" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jayesh@example.com"
                  className="auth-form__input auth-form__input--compact"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="auth-form__label">
                Password
              </label>
              <div className="auth-form__input-wrap">
                <Lock className="auth-form__input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 chars (1 uppercase & 1 number)"
                  className="auth-form__input auth-form__input--compact auth-form__input--password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-form__password-toggle"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="auth-icon auth-icon--small" /> : <Eye className="auth-icon auth-icon--small" />}
                </button>
              </div>
            </div>

            {/* Country Selector */}
            <div>
              <label className="auth-form__label">
                Country
              </label>
              <div className="auth-form__input-wrap">
                <Globe className="auth-form__input-icon" />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="auth-form__input auth-form__input--compact auth-form__select"
                >
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="auth-form__select-caret">
                  ▼
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-form__submit auth-form__submit--register"
            >
              <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
              <ArrowRight className="auth-icon auth-icon--small" />
            </button>
          </form>

          <div className="auth-card__footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-text-link auth-text-link--bold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Email Verification Confirmation Page
// ─────────────────────────────────────────────────────────────────────────────
export function VerifyEmailPage() {
  const navigate = useNavigate();

  return (
    <div className="auth-verification">
      <div className="auth-verification__card">
        <div className="auth-verification__icon">
          <CheckCircle2 className="auth-icon auth-icon--verification" />
        </div>
        <h1 className="auth-verification__title">Email Verified!</h1>
        <p className="auth-verification__summary">
          Your account token has been verified. You now have full access to list electronics and chat with buyers.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="auth-form__submit"
        >
          Proceed to Sign In
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Forgot Password Page
// ─────────────────────────────────────────────────────────────────────────────
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { api } = await import('../services/api');
      await api.auth.forgotPassword(email);
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-verification">
      <div className="auth-verification__card" style={{ maxWidth: '420px', textAlign: 'left' }}>
        <h1 className="auth-verification__title" style={{ fontSize: '24px', textAlign: 'center' }}>Reset Password</h1>
        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <p className="auth-verification__summary">
              If an account with <strong>{email}</strong> exists, we've sent password reset instructions.
            </p>
            <Link to="/login" className="auth-form__submit" style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
              Enter your registered email address and we will send you a secure link to reset your password.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#CBD5E1', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0F172A', color: '#fff', border: '1px solid #334155' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="auth-form__submit"
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link to="/login" style={{ color: '#10B981', fontSize: '14px', textDecoration: 'none' }}>
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reset Password Page
// ─────────────────────────────────────────────────────────────────────────────
export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { api } = await import('../services/api');
      await api.auth.resetPassword(token, password);
      toast.success('Password updated successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Invalid or expired reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-verification">
      <div className="auth-verification__card" style={{ maxWidth: '420px', textAlign: 'left' }}>
        <h1 className="auth-verification__title" style={{ fontSize: '24px', textAlign: 'center' }}>Set New Password</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#CBD5E1', marginBottom: '6px' }}>
              New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0F172A', color: '#fff', border: '1px solid #334155' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#CBD5E1', marginBottom: '6px' }}>
              Confirm Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0F172A', color: '#fff', border: '1px solid #334155' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="auth-form__submit"
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
