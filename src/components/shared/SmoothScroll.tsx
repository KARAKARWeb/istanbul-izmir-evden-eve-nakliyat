'use client';

import { useEffect } from 'react';

export function SmoothScroll() {
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="/#"]');
      
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('/#')) {
          e.preventDefault();
          const id = href.substring(2);
          const element = document.getElementById(id);
          
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
            
            // URL'yi güncelle
            window.history.pushState({}, '', href);
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return null;
}
