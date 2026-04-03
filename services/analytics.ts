export interface AnalyticsEvent {
  event: string;
  timestamp: string;
  properties?: Record<string, string | number | boolean>;
}

const ANALYTICS_KEY = 'analytics_events';

export const trackEvent = (event: string, properties?: AnalyticsEvent['properties']): void => {
  const currentEvents = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]') as AnalyticsEvent[];
  currentEvents.push({
    event,
    timestamp: new Date().toISOString(),
    properties,
  });
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(currentEvents));
};

export const getTrackedEvents = (): AnalyticsEvent[] => {
  return JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]') as AnalyticsEvent[];
};
