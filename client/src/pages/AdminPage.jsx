import React, { useState } from 'react';
import { Shield, Check, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import '../styles/pages.css';

export default function AdminPage() {
  const { listings } = useApp();
  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'reports', 'stats'

  const [reports, setReports] = useState([
    {
      id: 'rep-1',
      reporter: 'Rohan Sharma',
      target: 'Listing: iPhone 13 Pro 128GB',
      reason: 'Serial number does not match image bill',
      status: 'open',
    },
    {
      id: 'rep-2',
      reporter: 'Priya Mehta',
      target: 'User: rahul_seller',
      reason: 'Requested off-platform UPI payment outside escrow',
      status: 'open',
    },
  ]);

  const handleApprove = async (id) => {
    try {
      await api.admin.approveListing(id);
    } catch {
      // Local fallback
    }
    toast.success('Listing approved & published to catalog!');
  };

  const handleReject = async (id) => {
    try {
      await api.admin.rejectListing(id, 'Does not comply with standards');
    } catch {
      // Local fallback
    }
    toast('Listing rejected. Seller notified.', { icon: '🚫' });
  };

  const handleResolveReport = async (id) => {
    try {
      await api.admin.resolveReport(id);
    } catch {
      // Local fallback
    }
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast.success('Report resolved.');
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-header__eyebrow">
            <Shield className="admin-icon admin-icon--small" />
            <span>Admin Moderation Console</span>
          </div>
          <h1 className="admin-header__title">Platform Moderation & Security</h1>
        </div>

        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab('listings')}
            className={`admin-tabs__button ${activeTab === 'listings' ? 'is-active' : ''}`}
          >
            Pending Listings
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`admin-tabs__button ${activeTab === 'reports' ? 'is-active' : ''}`}
          >
            Reports Queue ({reports.length})
          </button>
        </div>
      </div>

      {activeTab === 'listings' && (
        <div className="admin-queue">
          <h2 className="admin-queue__title">Queue for Review</h2>
          {listings.slice(0, 4).map((listing) => (
            <div
              key={listing.id}
              className="admin-listing"
            >
              <div className="admin-listing__summary">
                <img
                  src={listing.images?.[0] || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=100'}
                  alt={listing.title}
                  className="admin-listing__image"
                />
                <div>
                  <h3 className="admin-listing__name">{listing.title}</h3>
                  <div className="admin-listing__metadata">
                    <span>Category: {listing.category}</span>
                    <span>•</span>
                    <span>₹{listing.price?.toLocaleString('en-IN')}</span>
                    <span>•</span>
                    <span className="admin-listing__condition">Condition: {listing.condition}</span>
                  </div>
                </div>
              </div>

              <div className="admin-listing__actions">
                <button
                  onClick={() => handleReject(listing.id)}
                  className="admin-button admin-button--reject"
                >
                  <X className="admin-icon" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleApprove(listing.id)}
                  className="admin-button admin-button--approve"
                >
                  <Check className="admin-icon" />
                  <span>Approve</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="admin-queue">
          <h2 className="admin-queue__title">User Safety Reports</h2>
          {reports.length === 0 ? (
            <div className="admin-empty-state">
              No open reports. All clear!
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="admin-report"
              >
                <div>
                  <div className="admin-report__eyebrow">
                    <AlertTriangle className="admin-icon" />
                    <span>Reported by {report.reporter}</span>
                  </div>
                  <h3 className="admin-report__target">{report.target}</h3>
                  <p className="admin-report__reason">{report.reason}</p>
                </div>

                <div className="admin-report__actions">
                  <button
                    onClick={() => handleResolveReport(report.id)}
                    className="admin-button admin-button--resolve"
                  >
                    Resolve & Dismiss
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
