// Web Vitals monitoring for Lighthouse optimization
export const reportWebVitals = () => {
  if ('web-vital' in window) {
    return;
  }

  // Largest Contentful Paint (LCP)
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('LCP:', entry.startTime);
    }
  });

  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch {
    // Browser doesn't support LCP
  }

  // First Input Delay (FID) using PerformanceObserver for interaction
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fid = entry.processingDuration;
      console.log('FID:', fid);
    }
  });

  try {
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch {
    // Browser doesn't support FID
  }

  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        console.log('CLS:', clsValue);
      }
    }
  });

  try {
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch {
    // Browser doesn't support CLS
  }

  // Navigation Timing
  if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log('Page Load Time:', pageLoadTime, 'ms');
        
        const connectTime = perfData.responseEnd - perfData.requestStart;
        console.log('Server Response Time:', connectTime, 'ms');
        
        const renderTime = perfData.domComplete - perfData.domLoading;
        console.log('DOM Render Time:', renderTime, 'ms');
      }, 0);
    });
  }
};

// Prefetch resources for better performance
export const prefetchResource = (url, as = 'fetch') => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = as;
  link.href = url;
  document.head.appendChild(link);
};

// Preload critical resources
export const preloadResource = (url, as = 'fetch') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = url;
  document.head.appendChild(link);
};
