// Performance monitoring and analytics utilities

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

interface PerformanceMetric {
  name: string;
  value: number;
  delta?: number;
  id?: string;
  attribution?: any;
}

interface UserEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

class Analytics {
  private isProduction = process.env.NODE_ENV === 'production';
  private gaId = process.env.NEXT_PUBLIC_GA_ID;
  private isDevelopment = process.env.NODE_ENV === 'development';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeGoogleAnalytics();
      this.initializeWebVitals();
    }
  }

  private initializeGoogleAnalytics() {
    if (!this.gaId || !this.isProduction) return;

    // Load Google Analytics
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer?.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.gaId, {
      // Enhanced measurement
      send_page_view: true,
      
      // Privacy settings
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      
      // Custom configuration
      custom_map: {
        custom_parameter_1: 'user_type',
        custom_parameter_2: 'subscription_status',
      },
    });
  }

  private initializeWebVitals() {
    if (typeof window === 'undefined') return;

    // Measure Core Web Vitals
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(this.sendToAnalytics.bind(this));
      onINP(this.sendToAnalytics.bind(this));
      onFCP(this.sendToAnalytics.bind(this));
      onLCP(this.sendToAnalytics.bind(this));
      onTTFB(this.sendToAnalytics.bind(this));
    });
  }

  private sendToAnalytics(metric: PerformanceMetric) {
    // Send to Google Analytics
    if (window.gtag && this.isProduction) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
        custom_parameters: {
          metric_delta: metric.delta,
          metric_value: metric.value,
        },
      });
    }

    // Send to custom analytics endpoint
    this.sendToCustomAnalytics({
      type: 'performance',
      metric: metric.name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      url: window.location.href,
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
    });

    // Console log in development
    if (this.isDevelopment) {
      console.log('📊 Performance Metric:', metric);
    }
  }

  private async sendToCustomAnalytics(data: any) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to send analytics data:', error);
    }
  }

  // Public methods for tracking events
  trackEvent(event: UserEvent) {
    // Google Analytics
    if (window.gtag && this.isProduction) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom_parameters,
      });
    }

    // Custom analytics
    this.sendToCustomAnalytics({
      type: 'event',
      action: event.action,
      category: event.category,
      label: event.label,
      value: event.value,
      url: window.location.href,
      timestamp: Date.now(),
      ...event.custom_parameters,
    });

    if (this.isDevelopment) {
      console.log('📈 Event Tracked:', event);
    }
  }

  trackPageView(path: string, title?: string) {
    if (window.gtag && this.isProduction) {
      window.gtag('config', this.gaId!, {
        page_path: path,
        page_title: title,
      });
    }

    this.sendToCustomAnalytics({
      type: 'pageview',
      path,
      title,
      referrer: document.referrer,
      timestamp: Date.now(),
    });

    if (this.isDevelopment) {
      console.log('📄 Page View:', { path, title });
    }
  }

  // Course-specific tracking
  trackCourseView(courseId: string, courseTitle: string) {
    this.trackEvent({
      action: 'course_view',
      category: 'Course',
      label: courseTitle,
      custom_parameters: {
        course_id: courseId,
      },
    });
  }

  trackLessonStart(lessonId: string, courseId: string) {
    this.trackEvent({
      action: 'lesson_start',
      category: 'Learning',
      custom_parameters: {
        lesson_id: lessonId,
        course_id: courseId,
      },
    });
  }

  trackLessonComplete(lessonId: string, courseId: string, watchTime: number) {
    this.trackEvent({
      action: 'lesson_complete',
      category: 'Learning',
      value: Math.round(watchTime),
      custom_parameters: {
        lesson_id: lessonId,
        course_id: courseId,
        watch_time: watchTime,
      },
    });
  }

  trackPurchase(courseId: string, value: number, currency: string = 'KRW') {
    this.trackEvent({
      action: 'purchase',
      category: 'Ecommerce',
      value,
      custom_parameters: {
        course_id: courseId,
        currency,
        transaction_id: `course_${courseId}_${Date.now()}`,
      },
    });
  }

  // User behavior tracking
  trackSearch(query: string, results: number) {
    this.trackEvent({
      action: 'search',
      category: 'Engagement',
      label: query,
      value: results,
      custom_parameters: {
        search_term: query,
        results_count: results,
      },
    });
  }

  trackFilter(filterType: string, filterValue: string) {
    this.trackEvent({
      action: 'filter',
      category: 'Engagement',
      label: `${filterType}:${filterValue}`,
      custom_parameters: {
        filter_type: filterType,
        filter_value: filterValue,
      },
    });
  }

  // Error tracking
  trackError(error: Error, context?: string) {
    this.trackEvent({
      action: 'error',
      category: 'Error',
      label: error.message,
      custom_parameters: {
        error_name: error.name,
        error_stack: error.stack,
        error_context: context,
      },
    });
  }

  // Performance tracking
  trackTiming(name: string, value: number, category: string = 'Performance') {
    this.trackEvent({
      action: 'timing',
      category,
      label: name,
      value: Math.round(value),
      custom_parameters: {
        timing_name: name,
        timing_value: value,
      },
    });
  }

  // User identification
  identifyUser(userId: string, properties?: Record<string, any>) {
    if (window.gtag && this.isProduction) {
      window.gtag('config', this.gaId!, {
        user_id: userId,
        custom_map: properties,
      });
    }

    this.sendToCustomAnalytics({
      type: 'identify',
      user_id: userId,
      properties,
      timestamp: Date.now(),
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();

// React hook for analytics
export function useAnalytics() {
  return analytics;
}