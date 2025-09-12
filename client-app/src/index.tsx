import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Comprehensive debugging
console.log('🚀 Client App: index.tsx loading...');
console.log('🚀 Client App: React version:', React.version);
console.log('🚀 Client App: Current URL:', window.location.href);
console.log('🚀 Client App: User Agent:', navigator.userAgent);
console.log('🚀 Client App: DOM element:', document.getElementById('root'));

// Check if we're in production
console.log('🚀 Client App: Environment:', process.env.NODE_ENV);
console.log('🚀 Client App: API URL:', process.env.REACT_APP_API_URL);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

console.log('🚀 Client App: Root created, rendering App...');

// Add error boundary
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('❌ ErrorBoundary: Caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ ErrorBoundary: Error details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          <h1>App Error</h1>
          <p>Something went wrong loading the app.</p>
          <p>Error: {this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

try {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('✅ Client App: App rendered successfully');
} catch (error) {
  console.error('❌ Client App: Error rendering App:', error);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
