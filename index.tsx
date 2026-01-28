import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill for crypto.randomUUID if it doesn't exist (e.g., insecure context or older browsers)
if (!('randomUUID' in crypto)) {
  // @ts-ignore
  crypto.randomUUID = function randomUUID() {
    return (
      "10000000-1000-4000-8000-100000000000"
    ).replace(/[018]/g, (c: any) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Application Failed to Mount:", error);
  rootElement.innerText = "Error loading application. Check console for details.";
}