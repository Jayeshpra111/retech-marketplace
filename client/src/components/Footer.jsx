import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, ShieldCheck, Leaf, Cpu } from 'lucide-react';
import '../styles/components.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">

        {/* Main 4-column footer */}
        <div className="site-footer__columns">

          {/* Brand & Mission column */}
          <div className="site-footer__brand-column">
            <Link to="/" className="site-footer__brand">
              <div className="site-footer__brand-mark">
                <Recycle className="site-footer__brand-icon" />
              </div>
              <span className="site-footer__brand-name">
                Re<span className="site-footer__brand-accent">Tech</span> <span className="site-footer__brand-suffix">Market</span>
              </span>
            </Link>

            <p className="site-footer__mission">
              Dedicated to circular electronics. We make buying and selling used devices, high-end PC components, and salvageable parts safe, transparent, and eco-friendly.
            </p>

            <div className="site-footer__impact-note">
              <div className="site-footer__impact-content">
                <Leaf className="site-footer__impact-icon" />
                <div className="site-footer__impact-copy">
                  <p className="site-footer__impact-title">UN E-Waste Global Monitor 2024</p>
                  <p className="site-footer__impact-description">
                    Over 62M tonnes of e-waste generated yearly with only ~22% properly recycled. Together we keep working silicon in circulation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Marketplace Navigation */}
          <div>
            <h4 className="site-footer__heading">Marketplace</h4>
            <ul className="site-footer__links">
              <li><Link to="/browse" className="site-footer__link">All Electronics</Link></li>
              <li><Link to="/browse?category=laptops" className="site-footer__link">Laptops & MacBooks</Link></li>
              <li><Link to="/browse?category=mobiles" className="site-footer__link">Smartphones</Link></li>
              <li><Link to="/browse?isComponent=true" className="site-footer__link site-footer__link--inline"><Cpu className="site-footer__link-icon site-footer__link-icon--blue" /> PC Components</Link></li>
              <li><Link to="/browse?condition=for_parts" className="site-footer__link site-footer__link--purple">Sell & Buy For Parts</Link></li>
              <li><Link to="/sell" className="site-footer__link site-footer__link--eco">Post a Free Listing</Link></li>
            </ul>
          </div>

          {/* Sustainability & Safety */}
          <div>
            <h4 className="site-footer__heading">Circular & Trust</h4>
            <ul className="site-footer__links">
              <li><Link to="/impact" className="site-footer__link">Impact Methodology</Link></li>
              <li><Link to="/recycle" className="site-footer__link">Authorized Recycler Hubs</Link></li>
              <li><a href="#data-wipe" onClick={(e) => { e.preventDefault(); alert("ReTech Data Wipe Guide:\n1. Backup personal files to external storage\n2. Sign out of iCloud, Google Account, and Steam\n3. Perform full cryptographic factory reset\n4. Remove physical SIM cards and MicroSD cards"); }} className="site-footer__link">Data Wipe Checklist</a></li>
              <li><span className="site-footer__trust"><ShieldCheck className="site-footer__trust-icon" /> Escrow Buyer Protection</span></li>
              <li><span className="site-footer__fine-print">IMEI & Serial Privacy Shield</span></li>
            </ul>
          </div>

          {/* Account & Policies */}
          <div>
            <h4 className="site-footer__heading">Account</h4>
            <ul className="site-footer__links">
              <li><Link to="/dashboard" className="site-footer__link">Seller Dashboard</Link></li>
              <li><Link to="/dashboard?tab=orders" className="site-footer__link">Orders & Tracking</Link></li>
              <li><Link to="/dashboard?tab=wishlist" className="site-footer__link">My Wishlist</Link></li>
              <li><span className="site-footer__fine-print">Privacy Policy (GDPR / DPDP Compliant)</span></li>
              <li><span className="site-footer__fine-print">Terms of Circular Exchange</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom row */}
        <div className="site-footer__bottom">
          <p>© 2026 ReTech Market Inc. Committed to zero-landfill electronics lifecycle.</p>
          <div className="site-footer__status-group">
            <span>Server: v1.0.0 (Node/Express Ready)</span>
            <span className="site-footer__status">
              <span className="site-footer__status-dot"></span>
              All Systems Operational
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
