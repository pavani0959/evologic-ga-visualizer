import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Antigravity GA App ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-[#161b22] border border-[#f85149] rounded-xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-[#f85149] mb-2 flex items-center gap-2">
              <span>⚠️ Application Initialization Error</span>
            </h2>
            <p className="text-xs text-[#8b949e] mb-4">
              An unexpected render error occurred. Click below to reload the visualizer cleanly.
            </p>
            <pre className="bg-[#0d1117] p-3 rounded text-[11px] font-mono text-[#ff7b72] overflow-x-auto mb-4 border border-[#30363d]">
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold px-4 py-2 rounded transition-colors"
            >
              Reload Visualizer
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

