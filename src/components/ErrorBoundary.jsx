import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error('[Ben Oz Gallery] Render failure', error, info);
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="app-error" role="alert">
          <p>The gallery could not be opened.</p>
          <button type="button" onClick={() => window.location.reload()}>Try again</button>
        </main>
      );
    }
    return this.props.children;
  }
}
