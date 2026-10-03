import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import '../styles/components.css';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <div className="error-panel">
            <div className="error-panel__icon">
              <AlertTriangle className="error-icon error-icon--large" />
            </div>
            
            <h1 className="error-panel__title">
              Something went wrong loading this view
            </h1>

            <p className="error-panel__message">
              We encountered an issue rendering this part of ReTech Market. Don't worry, your data and wishlist are safe.
            </p>

            <div className="error-panel__actions">
              <button
                onClick={this.handleReload}
                className="error-panel__button error-panel__button--secondary"
              >
                <RefreshCw className="error-icon error-icon--small" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleReset}
                className="error-panel__button error-panel__button--primary"
              >
                <Home className="error-icon error-icon--small" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
