import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Environment configuration
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Server-specific configuration
  debug: process.env.NODE_ENV === 'development',
  
  // Enhanced error context
  beforeSend(event, hint) {
    // Add server context
    if (event.exception) {
      const error = hint.originalException;
      
      // Skip expected errors
      if ((error as any)?.message?.includes('ECONNREFUSED')) {
        return null;
      }
      
      // Add server-specific tags
      event.tags = {
        ...event.tags,
        component: 'web-server',
        serverSide: true,
      };
    }
    
    return event;
  },
  
  // Server integrations - simplified for compatibility
  integrations: [
    // Advanced integrations disabled for build compatibility
    // new Sentry.Integrations.Http({ tracing: true }),
    // new Sentry.Integrations.OnUncaughtException(),
    // new Sentry.Integrations.OnUnhandledRejection(),
  ],
  
  // Additional context
  initialScope: {
    tags: {
      component: 'web-server',
      runtime: 'nodejs',
    },
  },
});