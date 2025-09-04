import * as React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Test function to validate React Query compatibility
const testReactQueryCompatibility = async () => {
  try {
    // Dynamic import to test if React Query can be loaded
    const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query');
    console.log('✅ React Query loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ React Query failed to load:', error);
    return false;
  }
};

const initializeApp = async () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);

  // Test React Query compatibility
  const reactQueryWorks = await testReactQueryCompatibility();

  if (reactQueryWorks) {
    console.log('🚀 Initializing with React Query optimization...');
    
    // Dynamically import QueryProvider only if React Query works
    try {
      const { QueryProvider } = await import('./providers/QueryProvider');
      
      root.render(
        <QueryProvider>
          <App />
        </QueryProvider>
      );
    } catch (error) {
      console.error('❌ QueryProvider failed, falling back to basic App:', error);
      root.render(<App />);
    }
  } else {
    console.log('⚠️ Running without React Query optimization');
    root.render(<App />);
  }
};

// Initialize the app
initializeApp().catch((error) => {
  console.error('❌ Failed to initialize app:', error);
  
  // Ultimate fallback - just render the app
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
  }
});