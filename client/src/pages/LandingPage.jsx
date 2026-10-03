import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Cpu,
  ShieldCheck,
  Leaf,
  Recycle,
  Lock,
  Sun,
  Moon
} from "lucide-react";
import { useApp } from "../context/AppContext";
import "../styles/landing.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useApp();

  return (
    <div className="landing-screen">

      {/* ── 1. Minimal Dark Header ───────────────────────────────────── */}
      <header className="landing-header">
        <div className="landing-header__inner">
          <Link to="/" className="landing-logo">
            <div className="landing-logo__icon">
              <Recycle size={20} />
            </div>
            <div className="landing-logo__text">
              <span className="landing-logo__brand">Re<span className="landing-logo__accent">Tech</span></span>
              <span className="landing-logo__sub">CIRCULAR MARKET</span>
            </div>
          </Link>

          <div className="landing-header__actions">
            <button
              type="button"
              className="landing-header__theme-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme Mode"
            >
              {theme === 'dark' ? <Sun size={16} style={{ color: '#f59e0b' }} /> : <Moon size={16} />}
            </button>
            <button
              type="button"
              className="landing-header__login-btn"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className="landing-header__cta-btn"
              onClick={() => navigate("/login")}
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. Hero Section (Image 1 Style) ─────────────────────────── */}
      <main className="landing-main">
        <div className="landing-hero">
          <div className="landing-hero__glow" />

          <div className="landing-hero__container">
            {/* Mission Badge */}
            <div className="landing-badge">
              <Sparkles size={14} className="landing-badge__icon" />
              <span>Next-Gen Circular Tech &amp; Hardware Marketplace</span>
            </div>

            {/* Headline */}
            <h1 className="landing-title">
              Keep Electronics in Circulation with{" "}
              <span className="landing-title__accent">ReTech Market</span>
            </h1>

            {/* Subtitle */}
            <p className="landing-subtitle">
              Production-ready circular marketplace engineered with automated escrow protection,
              certified component-level grading, and verified buyer-seller trust.
            </p>

            {/* CTA Buttons */}
            <div className="landing-actions">
              <button
                type="button"
                className="landing-btn-primary"
                onClick={() => navigate("/login")}
              >
                <span>Get Started Free</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="landing-btn-secondary"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </div>

            {/* 3 Tech Feature Cards (Image 1 Layout) */}
            <div className="landing-cards">
              {/* Card 1 */}
              <div className="landing-card">
                <div className="landing-card__icon landing-card__icon--blue">
                  <Cpu size={22} />
                </div>
                <h3 className="landing-card__title">Verified Hardware Architecture</h3>
                <p className="landing-card__desc">
                  Component-level diagnostics for GPUs, CPUs, motherboards, RAM, and MacBooks with verified condition grades.
                </p>
              </div>

              {/* Card 2 */}
              <div className="landing-card">
                <div className="landing-card__icon landing-card__icon--green">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="landing-card__title">100% Escrow Protection</h3>
                <p className="landing-card__desc">
                  Buyer funds remain safely secured in automated escrow until your hardware arrives, is benchmarked, and approved.
                </p>
              </div>

              {/* Card 3 */}
              <div className="landing-card">
                <div className="landing-card__icon landing-card__icon--purple">
                  <Leaf size={22} />
                </div>
                <h3 className="landing-card__title">LCA E-Waste &amp; Carbon Tracking</h3>
                <p className="landing-card__desc">
                  Every trade quantifies kilograms of diverted e-waste from landfills and embodied CO₂ emissions spared.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── 3. Minimal Clean Footer ─────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <p className="landing-footer__copy">
            &copy; {new Date().getFullYear()} ReTech Circular Market &bull; Verified Pre-Owned Electronics &amp; PC Hardware
          </p>
          <div className="landing-footer__links">
            <button type="button" onClick={() => navigate("/login")} className="landing-footer__link">Sign In</button>
            <span>&bull;</span>
            <button type="button" onClick={() => navigate("/register")} className="landing-footer__link">Create Account</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
