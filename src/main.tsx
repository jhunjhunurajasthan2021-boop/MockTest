import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Prevent unhandled promise rejections & internal popup assertion errors in sandboxed iframe preview from triggering error overlays
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason?.message || event.reason?.stack || event.reason || '');
    if (
      reasonStr.includes('INTERNAL ASSERTION') ||
      reasonStr.includes('Pending promise was never set') ||
      reasonStr.includes('popup-blocked') ||
      reasonStr.includes('popup-closed') ||
      reasonStr.includes('cancelled-popup-request')
    ) {
      console.warn('Caught and suppressed Firebase Auth popup error:', event.reason);
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('error', (event) => {
    const msg = String(event.message || event.error?.message || event.error?.stack || '');
    if (
      msg.includes('INTERNAL ASSERTION') ||
      msg.includes('Pending promise was never set') ||
      msg.includes('popup-blocked') ||
      msg.includes('cancelled-popup-request')
    ) {
      console.warn('Caught and suppressed popup assertion error:', event.message || event.error);
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }
  }, true);
}

console.log(">>> MAIN.TSX STARTING <<<");

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error("Root element not found");

  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
} catch (e) {
  console.error(">>> ERROR IN MAIN.TSX <<<", e);
}


