import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Environment configuration
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Enhanced error context
  beforeSend(event, hint) {
    // Filter out known non-critical errors
    if (event.exception) {
      const error = hint.originalException;
      
      // Skip hydration errors in development
      if (process.env.NODE_ENV === 'development' && 
          (error as any)?.message?.includes('Hydration')) {
        return null;
      }
      
      // Skip network errors from ad blockers
      if ((error as any)?.message?.includes('blocked by the client')) {
        return null;
      }
    }
    
    return event;
  },
  
  // User context
  initialScope: {
    tags: {
      component: 'web-app',
    },
  },
  
  // Advanced configuration
  ignoreErrors: [
    // Browser extensions
    'Non-Error promise rejection captured',
    'ChunkLoadError',
    'Loading chunk',
    'Loading CSS chunk',
    
    // Network errors
    'NetworkError',
    'fetch',
    
    // Third-party errors
    'Script error.',
    'ResizeObserver loop limit exceeded',
  ],
  
  // Integrations - simplified for build compatibility
  integrations: [
    // Advanced integrations disabled for build compatibility
    // new Sentry.Replay({
    //   maskAllText: process.env.NODE_ENV === 'production',
    //   blockAllMedia: process.env.NODE_ENV === 'production',
    // }),
    // new Sentry.BrowserTracing({
    //   routingInstrumentation: Sentry.nextRouterInstrumentation,
    // }),
  ],
});