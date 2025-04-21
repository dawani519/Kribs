import { createRoot } from "react-dom/client";
import paystackConfig from "./config/paystack";
import App from "./App";
import "./index.css";

// Load Paystack script
paystackConfig.loadPaystackScript().catch((error: Error) => {
  console.error("Failed to load Paystack script:", error);
});

// Initialize Firebase messaging if available
const initializeFirebaseMessaging = async () => {
  try {
    if ('serviceWorker' in navigator) {
      // In a real app, we would register a service worker and initialize Firebase here
      console.log('Firebase messaging would be initialized here in a real app');
    }
  } catch (error) {
    console.error('Error initializing Firebase messaging:', error);
  }
};

// Initialize error monitoring with Sentry in production
const initializeSentry = async () => {
  // Check if we're in production by looking at import.meta.env.MODE
  if (import.meta.env.MODE === 'production') {
    try {
      const Sentry = await import('@sentry/browser');
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN || '',
        integrations: [],
        tracesSampleRate: 1.0,
      });
    } catch (error) {
      console.error('Error initializing Sentry:', error);
    }
  }
};

// Initialize services
Promise.all([
  initializeFirebaseMessaging(),
  initializeSentry()
]).finally(() => {
  // Start the app regardless of service initialization status
  createRoot(document.getElementById("root")!).render(<App />);
});
