import React, { useState } from 'react';
import { 
  ShieldCheck, 
  BatteryCharging, 
  Monitor, 
  HardDrive, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Camera, 
  Volume2, 
  Wifi, 
  Image as ImageIcon,
  Check,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/components.css';

export default function DeviceHealthReportCard({ report: initialReport, listingId, isAdmin = false }) {
  const [report, setReport] = useState(initialReport);
  const [activeTab, setActiveTab] = useState('overview');
  const [activePhoto, setActivePhoto] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!report) return null;

  const score = report.healthScore ?? 100;
  
  // Score color grading
  let scoreColor = '#10B981'; // Green
  let scoreGrade = 'Excellent';
  if (score < 50) {
    scoreColor = '#EF4444'; // Red
    scoreGrade = 'Critical Issues';
  } else if (score < 75) {
    scoreColor = '#F59E0B'; // Amber
    scoreGrade = 'Fair / Degraded';
  } else if (score < 90) {
    scoreColor = '#3B82F6'; // Blue
    scoreGrade = 'Good Condition';
  }

  const handleAdminVerify = async () => {
    if (!isAdmin) return;
    setIsVerifying(true);
    try {
      const res = await api.listings.verifyHealthReport(listingId, !report.isVerified);
      setReport(res.data);
      toast.success(res.data.isVerified ? 'Health report verified!' : 'Verification revoked.');
    } catch (err) {
      toast.error('Failed to update verification status.');
    } finally {
      setIsVerifying(false);
    }
  };

  const isBatteryDevice = ['phone', 'laptop', 'tablet'].includes(report.deviceType);

  return (
    <div className="health-report-card">
      {/* Top Header */}
      <div className="health-report-header">
        <div className="health-report-title-row">
          <div className="health-report-badge-icon">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="health-report-heading">Verified Hardware Diagnostics</h3>
            <div className="health-report-status-pills">
              {report.isVerified ? (
                <span className="badge-report-verified">
                  <CheckCircle2 size={13} /> ReTech Admin Verified
                </span>
              ) : (
                <span className="badge-report-unverified">
                  <AlertTriangle size={13} /> Seller Reported (Self-Certified)
                </span>
              )}
              {report.verifiedAt && (
                <span className="health-report-date">
                  Verified {new Date(report.verifiedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Big Health Score Meter */}
        <div className="health-score-dial" style={{ borderColor: scoreColor }}>
          <span className="health-score-val" style={{ color: scoreColor }}>{score}</span>
          <span className="health-score-sub">/ 100</span>
          <span className="health-score-grade" style={{ color: scoreColor }}>{scoreGrade}</span>
        </div>
      </div>

      {/* Tabs / Breakdown Filter */}
      <div className="health-report-tabs">
        <button
          type="button"
          className={`health-tab-btn ${activeTab === 'overview' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Diagnostic Checklist
        </button>
        {report.evidence && report.evidence.length > 0 && (
          <button
            type="button"
            className={`health-tab-btn ${activeTab === 'evidence' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('evidence')}
          >
            Evidence Photos ({report.evidence.length})
          </button>
        )}
      </div>

      {/* Content Area */}
      {activeTab === 'overview' ? (
        <div className="health-checklist-grid">
          
          {/* Battery section if applicable */}
          {isBatteryDevice && report.battery && (
            <div className="health-check-item">
              <div className="check-item-icon">
                <BatteryCharging size={18} />
              </div>
              <div className="check-item-content">
                <div className="check-item-header">
                  <strong>Battery Health</strong>
                  {report.battery.healthPercent !== null && (
                    <span className={`check-value ${report.battery.healthPercent >= 80 ? 'good' : 'warning'}`}>
                      {report.battery.healthPercent}%
                    </span>
                  )}
                </div>
                <div className="check-item-sub">
                  <span>Cycle Count: {report.battery.cycleCount ?? 'N/A'}</span>
                  <span>•</span>
                  <span>Charges: {report.battery.chargesProperly ? 'Normal' : 'Issues Detected'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Screen / Display */}
          {report.screen && (
            <div className="health-check-item">
              <div className="check-item-icon">
                <Monitor size={18} />
              </div>
              <div className="check-item-content">
                <div className="check-item-header">
                  <strong>Display & Glass</strong>
                  {report.screen.touchWorks && !report.screen.deadPixels && !report.screen.burnIn ? (
                    <span className="status-pass"><CheckCircle2 size={14} /> Passed</span>
                  ) : (
                    <span className="status-fail"><XCircle size={14} /> Defects Reported</span>
                  )}
                </div>
                <div className="check-item-sub">
                  <span>Touch: {report.screen.touchWorks ? 'Responsive' : 'Broken'}</span>
                  <span>•</span>
                  <span>Dead Pixels: {report.screen.deadPixels ? 'Yes' : 'None'}</span>
                  <span>•</span>
                  <span>Glass: {report.screen.scratches}</span>
                </div>
              </div>
            </div>
          )}

          {/* Storage & SMART */}
          {report.storage && (
            <div className="health-check-item">
              <div className="check-item-icon">
                <HardDrive size={18} />
              </div>
              <div className="check-item-content">
                <div className="check-item-header">
                  <strong>Drive & SMART Health</strong>
                  <span className={`smart-badge smart-${report.storage.smartStatus}`}>
                    {report.storage.smartStatus?.toUpperCase()}
                  </span>
                </div>
                <div className="check-item-sub">
                  {report.storage.sizeGB && <span>Size: {report.storage.sizeGB} GB • </span>}
                  <span>Diagnostic health test status</span>
                </div>
              </div>
            </div>
          )}

          {/* Ports */}
          {report.ports && report.ports.length > 0 && (
            <div className="health-check-item">
              <div className="check-item-icon">
                <Cpu size={18} />
              </div>
              <div className="check-item-content">
                <div className="check-item-header">
                  <strong>Input / Output Ports</strong>
                  <span className="port-count-tag">
                    {report.ports.filter(p => p.works).length} of {report.ports.length} functional
                  </span>
                </div>
                <div className="check-ports-list">
                  {report.ports.map((port, idx) => (
                    <span key={idx} className={`port-pill ${port.works ? 'working' : 'broken'}`}>
                      {port.works ? <Check size={11} /> : <XCircle size={11} />}
                      {port.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Peripherals & Connectivity */}
          <div className="health-check-item">
            <div className="check-item-icon">
              <Wifi size={18} />
            </div>
            <div className="check-item-content">
              <div className="check-item-header">
                <strong>Sensors & Connectivity</strong>
              </div>
              <div className="check-peripherals-row">
                <span className={`periph-tag ${report.wifiBluetooth ? 'ok' : 'fail'}`}>
                  WiFi/Bluetooth {report.wifiBluetooth ? '✓' : '✗'}
                </span>
                <span className={`periph-tag ${report.speakers ? 'ok' : 'fail'}`}>
                  Speakers {report.speakers ? '✓' : '✗'}
                </span>
                <span className={`periph-tag ${report.camera ? 'ok' : 'fail'}`}>
                  Camera {report.camera ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {report.notes && (
            <div className="health-notes-card">
              <strong>Seller Diagnostic Notes:</strong>
              <p>{report.notes}</p>
            </div>
          )}

        </div>
      ) : (
        /* Evidence Photos Gallery */
        <div className="health-evidence-gallery">
          <div className="evidence-thumbs-grid">
            {report.evidence.map((photo, idx) => (
              <div
                key={idx}
                className="evidence-thumb-wrap"
                onClick={() => setActivePhoto(photo)}
              >
                <img src={photo.url} alt={photo.caption || 'Diagnostic test photo'} />
                {photo.caption && <span className="evidence-caption">{photo.caption}</span>}
              </div>
            ))}
          </div>

          {activePhoto && (
            <div className="evidence-lightbox-overlay" onClick={() => setActivePhoto(null)}>
              <div className="evidence-lightbox-box" onClick={(e) => e.stopPropagation()}>
                <img src={activePhoto.url} alt="Diagnostic full preview" />
                <button
                  type="button"
                  className="lightbox-close"
                  onClick={() => setActivePhoto(null)}
                >
                  ✕ Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Action Control */}
      {isAdmin && (
        <div className="health-admin-toolbar">
          <button
            type="button"
            onClick={handleAdminVerify}
            disabled={isVerifying}
            className={`btn-admin-verify ${report.isVerified ? 'is-verified' : ''}`}
          >
            <ShieldCheck size={16} />
            {report.isVerified ? 'Revoke Verification' : 'Verify Diagnostic Report'}
          </button>
        </div>
      )}
    </div>
  );
}
