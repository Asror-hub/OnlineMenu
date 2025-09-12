import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

console.log('🚀 Client App: index.tsx loading...');
console.log('🚀 Client App: React version:', React.version);
console.log('🚀 Client App: DOM element:', document.getElementById('root'));

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

console.log('🚀 Client App: Root created, rendering App...');

try {
  root.render(
    <React.StrictMode>
      <App />
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
