import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { CONDITION_GRADES } from '../data/mockData';
import '../styles/components.css';

export default function ConditionModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="condition-overlay">
      <div className="condition-dialog">
        <div className="condition-dialog__header">
          <div>
            <h3 className="condition-dialog__title">
              <ShieldCheck className="condition-icon condition-icon--medium" />
              ReTech Condition Grading Standards
            </h3>
            <p className="condition-dialog__summary">
              Standardized inspection criteria for devices, hardware, and components
            </p>
          </div>
          <button
            onClick={onClose}
            className="condition-dialog__close"
          >
            <X className="condition-icon condition-icon--medium" />
          </button>
        </div>

        <div className="condition-list">
          {Object.entries(CONDITION_GRADES).map(([key, info]) => (
            <div key={key} className="condition-list__item">
              <div className="condition-list__heading">
                <span className={`condition-list__grade condition-list__grade--${key.replaceAll('_', '-')}`}>
                  <span className={`condition-list__dot condition-list__dot--${key.replaceAll('_', '-')}`}></span>
                  {info.label}
                </span>
                {key === 'for_parts' && (
                  <span className="condition-list__salvage">
                    Circular Salvage
                  </span>
                )}
              </div>
              <p className="condition-list__description">
                {info.description}
              </p>
            </div>
          ))}
        </div>

        <div className="condition-dialog__footer">
          <button
            onClick={onClose}
            className="condition-dialog__confirm"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
