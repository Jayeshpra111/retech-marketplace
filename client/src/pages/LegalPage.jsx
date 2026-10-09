import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, FileText, Lock, RefreshCw } from 'lucide-react';
import '../styles/pages.css';

export default function LegalPage() {
  const { type = 'terms' } = useParams();

  const content = {
    terms: {
      title: 'Terms of Service',
      badge: 'User Agreement & Policies',
      updated: 'October 2026',
      sections: [
        {
          heading: '1. Platform Overview',
          text: 'ReTech Market is a peer-to-peer marketplace for verified pre-owned electronics, PC components, and salvage hardware. By accessing our services, buyers and sellers agree to transact honestly and abide by condition grading standards.',
        },
        {
          heading: '2. Escrow Protection',
          text: 'All online orders require escrow deposit through our authorized payment providers. Funds are held securely until the buyer inspects the package and confirms delivery, or until the automated inspection window expires.',
        },
        {
          heading: '3. Seller Obligations & Prohibited Items',
          text: 'Sellers must disclose all defects, perform data sanitization, and confirm ownership. Counterfeit goods, stolen hardware, and devices with active remote locks (iCloud, FRP, MDM) are strictly prohibited and result in permanent bans.',
        },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      badge: 'Data Protection & Security',
      updated: 'October 2026',
      sections: [
        {
          heading: '1. Information We Collect',
          text: 'We collect registration details (name, email), shipping addresses for order fulfillment, and transaction history. We do NOT store complete payment card credentials or UPI PINs.',
        },
        {
          heading: '2. Data Protection & Encryption',
          text: 'All communications and token exchanges are secured with 256-bit TLS/SSL encryption. Refresh tokens are hashed using cryptographic one-way functions with multi-device tracking.',
        },
        {
          heading: '3. Data Retention & Deletion',
          text: 'Users have the right to request full account erasure at any time, subject to legal requirements regarding completed tax and escrow transaction logs.',
        },
      ],
    },
    refunds: {
      title: 'Escrow Refund Policy',
      badge: 'Buyer & Seller Protection',
      updated: 'October 2026',
      sections: [
        {
          heading: '1. 48-Hour Inspection Window',
          text: 'Upon courier delivery confirmation, buyers have 48 hours to power on, test, and inspect the received hardware before funds are released to the seller.',
        },
        {
          heading: '2. Dispute Eligibility',
          text: 'Refunds are granted if the item is materially defective (and not sold under "For Parts" disclosure), counterfeit, or damaged during transit without proper seller packaging.',
        },
        {
          heading: '3. Payout Release & Settlement',
          text: 'If no dispute is logged within the auto-confirmation window, or upon manual buyer confirmation, escrow funds are transferred to the seller wallet.',
        },
      ],
    },
  };

  const current = content[type] || content.terms;

  return (
    <div style={{ maxWidth: '860px', margin: '40px auto', padding: '0 20px', minHeight: '70vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#10B981', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <Link
          to="/legal/terms"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            background: type === 'terms' ? '#10B981' : 'rgba(255, 255, 255, 0.05)',
            color: type === 'terms' ? '#fff' : '#94A3B8',
          }}
        >
          Terms of Service
        </Link>
        <Link
          to="/legal/privacy"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            background: type === 'privacy' ? '#10B981' : 'rgba(255, 255, 255, 0.05)',
            color: type === 'privacy' ? '#fff' : '#94A3B8',
          }}
        >
          Privacy Policy
        </Link>
        <Link
          to="/legal/refunds"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            background: type === 'refunds' ? '#10B981' : 'rgba(255, 255, 255, 0.05)',
            color: type === 'refunds' ? '#fff' : '#94A3B8',
          }}
        >
          Refund & Escrow Policy
        </Link>
      </div>

      <div style={{ background: '#111827', borderRadius: '16px', padding: '36px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {current.badge}
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '8px 0 12px', color: '#F9FAFB' }}>
          {current.title}
        </h1>
        <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '32px' }}>
          Last updated: {current.updated}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {current.sections.map((sec, i) => (
            <div key={i} style={{ borderBottom: i < current.sections.length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none', paddingBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#E5E7EB', marginBottom: '10px' }}>
                {sec.heading}
              </h3>
              <p style={{ color: '#9CA3AF', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
                {sec.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
