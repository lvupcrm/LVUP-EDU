import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

@Injectable()
export class SentryService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const dsn = this.configService.get<string>('SENTRY_DSN');
    const environment = this.configService.get<string>('NODE_ENV');
    const release = this.configService.get<string>('APP_VERSION');

    if (!dsn) {
      console.warn('Sentry DSN not configured, error tracking disabled');
      return;
    }

    Sentry.init({
      dsn,
      environment,
      release,
      
      // Performance monitoring
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
      
      // Debug mode for development
      debug: environment === 'development',
      
      // Enhanced error context
      beforeSend(event, hint) {
        const error = hint.originalException;
        
        // Add API-specific context
        event.tags = {
          ...event.tags,
          component: 'api-server',
          runtime: 'nodejs',
          framework: 'nestjs',
        };
        
        // Filter out known non-critical errors
        if (error?.message?.includes('ECONNRESET')) {
          return null;
        }
        
        if (error?.message?.includes('cancelled')) {
          return null;
        }
        
        return event;
      },
      
      // Integrations
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app: undefined }),
        new Sentry.Integrations.OnUncaughtException({
          exitEvenIfOtherHandlersAreRegistered: false,
        }),
        new Sentry.Integrations.OnUnhandledRejection({
          mode: 'warn',
        }),
        new ProfilingIntegration(),
      ],
      
      // Initial scope
      initialScope: {
        tags: {
          component: 'api-server',
        },
      },
    });

    console.log('✅ Sentry initialized for API server');
  }

  // Utility methods for custom error reporting
  captureException(error: any, context?: any) {
    return Sentry.captureException(error, {
      contexts: { custom: context },
    });
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: any) {
    return Sentry.captureMessage(message, level);
  }

  addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
    Sentry.addBreadcrumb(breadcrumb);
  }

  setUser(user: { id: string; email?: string; username?: string }) {
    Sentry.setUser(user);
  }

  setTag(key: string, value: string) {
    Sentry.setTag(key, value);
  }

  setContext(key: string, context: any) {
    Sentry.setContext(key, context);
  }

  // Transaction helpers
  startTransaction(name: string, op: string) {
    return Sentry.startTransaction({ name, op });
  }

  // Performance monitoring
  withTransaction<T>(
    name: string,
    op: string,
    callback: (transaction: Sentry.Transaction) => Promise<T>
  ): Promise<T> {
    const transaction = this.startTransaction(name, op);
    
    return callback(transaction)
      .then(result => {
        transaction.setStatus('ok');
        return result;
      })
      .catch(error => {
        transaction.setStatus('internal_error');
        this.captureException(error);
        throw error;
      })
      .finally(() => {
        transaction.finish();
      });
  }
}