import { useEffect } from 'react';

function useGoogleAnalytics() {
  useEffect(() => {
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.REACT_APP_GTM_CODE}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){ dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', '${process.env.REACT_APP_GTM_CODE}');
    `;
    document.head.appendChild(script2);
  }, []);
}

export default useGoogleAnalytics;
