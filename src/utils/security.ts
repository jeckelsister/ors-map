/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize HTML input to prevent XSS attacks
 */
export const sanitizeHtml = (input: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  const reg = /[&<>"'/]/gi;
  return input.replace(reg, match => map[match]);
};

/**
 * Validate coordinate values
 */
export const validateCoordinates = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
};

/**
 * Validate file name for GPX export
 */
export const validateFileName = (fileName: string): string => {
  const sanitized = fileName.replace(/[^a-zA-Z0-9_\-\s]/g, '');
  return sanitized.substring(0, 100);
};

/**
 * Validate URL for external links
 */
export const validateUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validate API response structure
 */
export const validateApiResponse = (response: unknown): boolean => {
  if (!response || typeof response !== 'object') {
    return false;
  }

  return true;
};

/**
 * Rate limiting helper for API calls
 */
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests: number = 10, timeWindow: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  reset(): void {
    this.requests = [];
  }
}

export const apiRateLimiter = new RateLimiter(20, 60000); // 20 requests per minute
