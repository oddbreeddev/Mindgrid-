
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error("App Crash:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <i className="fas fa-exclamation-triangle text-2xl text-red-500"></i>
          </div>
          <h1 className="text-2xl font-black mb-2">Something went wrong.</h1>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
            {(this.state.error as any)?.message || "An unexpected error occurred while loading the application."}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold transition-all active:scale-95"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Could not find root element");
  const errDiv = document.createElement('div');
  errDiv.style.color = 'red';
  errDiv.style.padding = '20px';
  errDiv.innerText = 'Critical Error: Root element not found.';
  document.body.appendChild(errDiv);
  throw new Error("Could not find root element");
}

console.log("MindGrid: Starting React mount...");
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
console.log("MindGrid: React mount initiated.");
