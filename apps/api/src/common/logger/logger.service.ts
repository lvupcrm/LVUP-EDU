import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

interface LogContext {
  userId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  error?: Error;
  [key: string]: any;
}

@Injectable()
export class CustomLoggerService implements LoggerService {
  private readonly logger: winston.Logger;
  private readonly logLevel: string;
  private readonly isDevelopment: boolean;

  constructor(private configService: ConfigService) {
    this.logLevel = this.configService.get<string>('LOG_LEVEL', 'info');
    this.isDevelopment = this.configService.get<string>('NODE_ENV') === 'development';
    
    this.logger = winston.createLogger({
      level: this.logLevel,
      format: this.isDevelopment 
        ? this.developmentFormat()
        : this.productionFormat(),
      transports: this.createTransports(),
      exitOnError: false,
    });
  }

  private developmentFormat() {
    return winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.colorize({ all: true }),
      winston.format.printf(({ timestamp, level, message, context, stack, ...meta }) => {
        let log = `${timestamp} [${level}] ${message}`;
        
        if (context) {
          log += ` [${context}]`;
        }
        
        if (Object.keys(meta).length > 0) {
          log += `\n${JSON.stringify(meta, null, 2)}`;
        }
        
        if (stack) {
          log += `\n${stack}`;
        }
        
        return log;
      })
    );
  }

  private productionFormat() {
    return winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf((info) => {
        return JSON.stringify({
          timestamp: info.timestamp,
          level: info.level,
          message: info.message,
          context: info.context,
          stack: info.stack,
          ...info,
        });
      })
    );
  }

  private createTransports(): winston.transport[] {
    const transports: winston.transport[] = [];

    // Console transport (always present)
    transports.push(
      new winston.transports.Console({
        handleExceptions: true,
        handleRejections: true,
      })
    );

    // File transports for production
    if (!this.isDevelopment) {
      // Error logs
      transports.push(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          handleExceptions: true,
        })
      );

      // Combined logs
      transports.push(
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        })
      );

      // Access logs for HTTP requests
      transports.push(
        new winston.transports.File({
          filename: 'logs/access.log',
          level: 'http',
          maxsize: 5242880, // 5MB
          maxFiles: 10,
        })
      );
    }

    return transports;
  }

  // NestJS LoggerService interface
  log(message: any, context?: string) {
    this.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, {
      context,
      stack: trace,
      timestamp: new Date().toISOString(),
    });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, {
      context,
      timestamp: new Date().toISOString(),
    });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, {
      context,
      timestamp: new Date().toISOString(),
    });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, {
      context,
      timestamp: new Date().toISOString(),
    });
  }

  // Custom logging methods
  info(message: string, meta: LogContext = {}) {
    this.logger.info(message, {
      ...meta,
      timestamp: new Date().toISOString(),
    });
  }

  http(message: string, meta: LogContext = {}) {
    this.logger.log('http', message, {
      ...meta,
      timestamp: new Date().toISOString(),
    });
  }

  // Structured logging for different scenarios
  logHttpRequest(req: any, res: any, responseTime: number) {
    const context: LogContext = {
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      statusCode: res.statusCode,
      responseTime,
      userId: req.user?.id,
      requestId: req.id,
    };

    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`;
    
    if (res.statusCode >= 400) {
      this.error(message, undefined, 'HTTP');
    } else {
      this.http(message, context);
    }
  }

  logDatabaseQuery(query: string, duration: number, context: LogContext = {}) {
    this.logger.debug('Database Query', {
      ...context,
      query: query.replace(/\s+/g, ' ').trim(),
      duration,
      type: 'database',
    });
  }

  logBusinessEvent(event: string, meta: LogContext = {}) {
    this.info(event, {
      ...meta,
      type: 'business',
    });
  }

  logSecurityEvent(event: string, meta: LogContext = {}) {
    this.logger.warn(event, {
      ...meta,
      type: 'security',
    });
  }

  logPerformanceMetric(metric: string, value: number, unit: string, meta: LogContext = {}) {
    this.info(`Performance: ${metric}`, {
      ...meta,
      metric,
      value,
      unit,
      type: 'performance',
    });
  }

  // Error logging with context
  logError(error: Error, context?: string, meta: LogContext = {}) {
    this.error(error.message, error.stack, context);
    
    // Additional structured error data
    this.logger.error('Error Details', {
      ...meta,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      type: 'error',
      timestamp: new Date().toISOString(),
    });
  }
}