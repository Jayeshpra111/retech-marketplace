import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Leaf, 
  Recycle, 
  CheckCircle, 
  AlertTriangle, 
  Mail, 
  MessageSquare, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Cpu,
  Lock,
  Truck,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/pages.css';

// ── About Page ─────────────────────────────────────────────────────────────
export function AboutPage() {
  return (
    <div className="info-page-wrapper">
      <div className="info-hero-section">
        <div className="info-hero-badge">
          <Leaf size={16} /> The Circular Electronics Movement
        </div>
        <h1>Building India's Most Trusted Circular Tech Marketplace</h1>
        <p className="info-hero-subtitle">
          Over 62 million metric tonnes of electronic waste are discarded every year.
          ReTech Market exists to give every GPU, motherboard, laptop, and smartphone a second life.
        </p>
      </div>

      <div className="info-content-container">
        {/* Mission 3 Pillars */}
        <div className="info-pillars-grid">
          <div className="info-pillar-card">
            <div className="pillar-icon pillar-icon-green">
              <Recycle size={28} />
            </div>
            <h3>Zero Landfill Target</h3>
            <p>
              Hardware that still works belongs in a rig, not a dump. We provide a transparent marketplace
              for components, whole machines, and salvageable parts.
            </p>
          </div>

          <div className="info-pillar-card">
            <div className="pillar-icon pillar-icon-blue">
              <ShieldCheck size={28} />
            </div>
            <h3>100% Escrow Protection</h3>
            <p>
              No scams, no dead-on-arrival components. Buyers have 48 hours to inspect hardware with real stress
              tests before payment is released to the seller.
            </p>
          </div>

          <div className="info-pillar-card">
            <div className="pillar-icon pillar-icon-purple">
              <Award size={28} />
            </div>
            <h3>Certified Recycler Network</h3>
            <p>
              When a device is truly beyond repair, we connect owners with certified R2/e-Stewards recyclers
              to ensure toxic metals are handled responsibly.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="info-stats-banner">
          <div className="stat-col">
            <span className="stat-big">12,400+ kg</span>
            <span className="stat-desc">E-Waste Diverted from Landfills</span>
          </div>
          <div className="stat-col">
            <span className="stat-big">18,200+ kg</span>
            <span className="stat-desc">CO₂ Emissions Prevented</span>
          </div>
          <div className="stat-col">
            <span className="stat-big">99.4%</span>
            <span className="stat-desc">Dispute Resolution Satisfaction</span>
          </div>
        </div>

        {/* Story Section */}
        <div className="info-story-section">
          <h2>Why We Started ReTech</h2>
          <p>
            Upgrading a PC shouldn't mean leaving an old GTX 1070 or Ryzen 5 in a desk drawer forever.
            Traditional classified platforms are plagued by fake UPI screenshots, defective hardware sellers,
            and ghosting. ReTech was engineered from the ground up specifically for tech enthusiasts, gamers,
            and sustainable enterprises.
          </p>
          <div className="info-cta-row">
            <Link to="/browse" className="btn-primary-info">Browse Available Hardware</Link>
            <Link to="/recycle" className="btn-secondary-info">Find Recyclers Near You</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Safety & Trust Guide ───────────────────────────────────────────────────
export function SafetyPage() {
  return (
    <div className="info-page-wrapper">
      <div className="info-hero-section">
        <div className="info-hero-badge">
          <ShieldCheck size={16} /> Buyer & Seller Protection
        </div>
        <h1>Safety & Escrow Guarantee</h1>
        <p className="info-hero-subtitle">
          How ReTech safeguards every transaction, prevents fraudulent claims, and ensures authentic tech trades.
        </p>
      </div>

      <div className="info-content-container">
        <div className="safety-steps-grid">
          <div className="safety-card">
            <div className="safety-step-number">01</div>
            <h3>How Escrow Protects Buyers</h3>
            <p>
              When you purchase an item on ReTech, your payment is held securely in an RBI-compliant escrow account.
              The seller only receives the payout once you receive the shipment and verify that the hardware works as described.
            </p>
            <ul className="safety-bullets">
              <li><CheckCircle size={15} /> 48-hour inspection window upon delivery</li>
              <li><CheckCircle size={15} /> Full refund if hardware is defective or not as described</li>
              <li><CheckCircle size={15} /> Dedicated mediator support for disputes</li>
            </ul>
          </div>

          <div className="safety-card">
            <div className="safety-step-number">02</div>
            <h3>How Escrow Protects Sellers</h3>
            <p>
              Sellers never have to worry about "payment on delivery" fraud or fake payment screenshots.
              We verify the buyer's funds before asking you to ship.
            </p>
            <ul className="safety-bullets">
              <li><CheckCircle size={15} /> Funds are locked upfront before dispatch</li>
              <li><CheckCircle size={15} /> Protected against fraudulent chargebacks</li>
              <li><CheckCircle size={15} /> Auto-release after 48 hours if buyer remains silent</li>
            </ul>
          </div>

          <div className="safety-card">
            <div className="safety-step-number">03</div>
            <h3>Hardware Testing Checklist</h3>
            <p>
              Follow our golden checklist during your 48-hour inspection period before confirming delivery:
            </p>
            <ul className="safety-bullets">
              <li><CheckCircle size={15} /> Run FurMark / 3DMark on GPUs for thermal stability</li>
              <li><CheckCircle size={15} /> Run MemTest86 on RAM sticks for memory errors</li>
              <li><CheckCircle size={15} /> Check CrystalDiskInfo for SSD/HDD health & SMART data</li>
              <li><CheckCircle size={15} /> Check serial numbers match the listing photos</li>
            </ul>
          </div>

          <div className="safety-card warning-card">
            <div className="safety-step-number"><AlertTriangle size={24} className="text-amber-400" /></div>
            <h3>Golden Safety Rules</h3>
            <ul className="safety-bullets">
              <li><strong>Never pay outside ReTech:</strong> UPI links or direct bank transfers are not covered by our escrow.</li>
              <li><strong>Keep chat on ReTech:</strong> Messages outside the platform cannot be used as dispute evidence.</li>
              <li><strong>Record unboxing videos:</strong> A continuous unboxing video is recommended for high-value PC components.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FAQ Page ───────────────────────────────────────────────────────────────
export function FaqPage() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'How does the ReTech Escrow payment system work?',
      a: 'When you purchase an item, your money is securely deposited into our escrow account via Razorpay. The seller is notified to pack and ship the item. Once tracking confirms delivery, you have 48 hours to inspect and stress-test the hardware. If satisfied, you confirm delivery and funds are released to the seller.'
    },
    {
      q: 'What happens if a component is broken or dead on arrival?',
      a: 'You can immediately raise an Escrow Dispute from your dashboard within the 48-hour inspection window. Funds remain locked. Our mediation team will review your photos/videos (e.g. stress tests or BIOS detection) and arrange a return and full refund.'
    },
    {
      q: 'Can I negotiate the price with the seller?',
      a: 'Yes! On any listing page, click "Make an Offer" to propose a price. The seller can accept, decline, or counter within 48 hours. If accepted, you can check out directly at the negotiated price.'
    },
    {
      q: 'What is the "For Parts & Salvage" category?',
      a: 'This category is specifically for non-working, broken, or untested devices that still contain valuable recovery components (such as display assemblies, capacitors, cooling fans, heatsinks, or gold pins) intended for repair enthusiasts and e-waste recyclers.'
    },
    {
      q: 'Are sellers verified on ReTech Market?',
      a: 'Yes! Sellers undergo email verification, account history auditing, and community ratings. Top sellers earn the "Verified Seller" badge through consistent positive reviews and rapid shipping.'
    },
    {
      q: 'How does recycling work on ReTech?',
      a: 'Visit our Recycler Directory to find certified e-waste collection facilities and drop-off hubs in your city. Certified centers handle recycling under official pollution control board and ISO 14001 guidelines.'
    }
  ];

  return (
    <div className="info-page-wrapper">
      <div className="info-hero-section">
        <div className="info-hero-badge">
          <HelpCircle size={16} /> Frequently Asked Questions
        </div>
        <h1>Everything You Need to Know</h1>
        <p className="info-hero-subtitle">
          Got questions about escrow, returns, component testing, or recycling? Find answers below.
        </p>
      </div>

      <div className="info-content-container">
        <div className="faq-accordion-list">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className={`faq-item-card ${isOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                >
                  <span className="faq-question-text">{faq.q}</span>
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {isOpen && (
                  <div className="faq-answer-pane">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="faq-still-have-questions">
          <h3>Still have questions?</h3>
          <p>Our support and mediation team is here to assist you 7 days a week.</p>
          <Link to="/contact" className="btn-contact-support">
            Contact Support Team
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Contact & Support Page ────────────────────────────────────────────────
export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitted(true);
    toast.success('Your message has been received! Our support team will reply within 24 hours.');
  };

  return (
    <div className="info-page-wrapper">
      <div className="info-hero-section">
        <div className="info-hero-badge">
          <Mail size={16} /> Get In Touch
        </div>
        <h1>Contact & Support Desk</h1>
        <p className="info-hero-subtitle">
          Have an inquiry regarding an order, dispute escalation, or recycler partnership? We are here to help.
        </p>
      </div>

      <div className="info-content-container contact-layout-container">
        <div className="contact-details-panel">
          <h2>Contact Information</h2>
          <p className="contact-sub">Direct channels for marketplace questions and partnership inquiries.</p>

          <div className="contact-card-item">
            <Mail className="contact-card-icon" />
            <div>
              <strong>Customer & Dispute Support</strong>
              <p>support@retechmarket.com</p>
              <span className="contact-hint">Average reply under 4 hours</span>
            </div>
          </div>

          <div className="contact-card-item">
            <Recycle className="contact-card-icon" />
            <div>
              <strong>Recycler & Enterprise Partners</strong>
              <p>partners@retechmarket.com</p>
              <span className="contact-hint">For bulk e-waste hubs & recyclers</span>
            </div>
          </div>

          <div className="contact-card-item">
            <ShieldCheck className="contact-card-icon" />
            <div>
              <strong>Escrow Protection Desk</strong>
              <p>escrow@retechmarket.com</p>
              <span className="contact-hint">Urgent payment & dispute holds</span>
            </div>
          </div>
        </div>

        <div className="contact-form-panel">
          {submitted ? (
            <div className="contact-success-card">
              <CheckCircle size={48} className="text-emerald-500" />
              <h3>Message Sent Successfully!</h3>
              <p>
                Thank you for contacting ReTech Support. A support ticket has been created and our team will
                email you at <strong>{formData.email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: 'general', message: '' });
                }}
                className="btn-send-another"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <h3>Send us a Message</h3>
              
              <div className="form-group-item">
                <label>Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group-item">
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group-item">
                <label>Topic / Category</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option value="general">General Inquiry</option>
                  <option value="order">Order & Shipping Status</option>
                  <option value="escrow">Escrow Payment & Payout</option>
                  <option value="dispute">Urgent Dispute Assistance</option>
                  <option value="recycler">Recycler Directory Listing</option>
                </select>
              </div>

              <div className="form-group-item">
                <label>Message *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Describe your question or issue in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-submit-contact">
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
