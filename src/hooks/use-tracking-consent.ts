import { useEffect } from "react";
import { getConsent, CookiePreferences } from "@/lib/cookie-consent";

// Replace these with your real IDs when ready
const GA4_ID = "G-XXXXXXXXXX";
const META_PIXEL_ID = "000000000000000";

const injectGA4 = () => {
  if (document.getElementById("ga4-script")) return;
  const s = document.createElement("script");
  s.id = "ga4-script";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(s);

  const s2 = document.createElement("script");
  s2.id = "ga4-inline";
  s2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA4_ID}', { anonymize_ip: true });
  `;
  document.head.appendChild(s2);
};

const injectMetaPixel = () => {
  if (document.getElementById("meta-pixel-script")) return;
  const s = document.createElement("script");
  s.id = "meta-pixel-script";
  s.textContent = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${META_PIXEL_ID}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(s);
};

const applyConsent = (prefs: CookiePreferences) => {
  if (prefs.analytics) injectGA4();
  if (prefs.marketing) injectMetaPixel();
};

export const useTrackingConsent = () => {
  useEffect(() => {
    // Check existing consent on mount
    const existing = getConsent();
    if (existing) applyConsent(existing);

    // Listen for new consent events
    const handler = (e: Event) => {
      const prefs = (e as CustomEvent<CookiePreferences>).detail;
      applyConsent(prefs);
    };
    window.addEventListener("cookie-consent-updated", handler);
    return () => window.removeEventListener("cookie-consent-updated", handler);
  }, []);
};
