import { useState, useEffect } from "react";
import { getConsent, saveConsent } from "@/lib/cookie-consent";
import { Cookie, Settings2, Check, X } from "lucide-react";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = getConsent();
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
    setVisible(false);
  };

  const handleRejectAll = () => {
    saveConsent({ analytics: false, marketing: false });
    setVisible(false);
  };

  const handleSaveSettings = () => {
    saveConsent({ analytics, marketing });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" />

      {/* Banner */}
      <div className="relative w-full max-w-3xl mx-3 sm:mx-4 mb-4 sm:mb-6 pointer-events-auto animate-in slide-in-from-bottom-4 duration-500 max-h-[85vh] overflow-y-auto">
        <div className="bg-[hsl(var(--navy))] border border-gold/20 p-5 sm:p-6 md:p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <Cookie className="w-6 h-6 text-gold flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold text-cream mb-1">
                We Value Your Privacy
              </h3>
              <p className="font-body text-sm text-gold-muted leading-relaxed">
                We use cookies to enhance your experience. Necessary cookies ensure the site functions properly. 
                Analytics cookies help us understand how you use our site. Marketing cookies enable personalized advertising. 
                You can manage your preferences below.
              </p>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="border-t border-gold/10 pt-5 mb-5 space-y-4">
              {/* Necessary — always on */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-sm font-medium text-cream">Necessary</p>
                  <p className="font-body text-xs text-gold-muted">Required for the site to function. Always enabled.</p>
                </div>
                <div className="w-11 h-6 bg-gold/30 rounded-full relative cursor-not-allowed">
                  <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-gold rounded-full" />
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-sm font-medium text-cream">Analytics</p>
                  <p className="font-body text-xs text-gold-muted">Google Analytics 4 — helps us measure site performance.</p>
                </div>
                <button
                  onClick={() => setAnalytics(!analytics)}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${analytics ? "bg-gold/30" : "bg-cream/10"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 ${analytics ? "right-0.5 bg-gold" : "left-0.5 bg-cream/40"}`} />
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-sm font-medium text-cream">Marketing</p>
                  <p className="font-body text-xs text-gold-muted">Meta Pixel — enables targeted advertising and retargeting.</p>
                </div>
                <button
                  onClick={() => setMarketing(!marketing)}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${marketing ? "bg-gold/30" : "bg-cream/10"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 ${marketing ? "right-0.5 bg-gold" : "left-0.5 bg-cream/40"}`} />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {showSettings ? (
              <button
                onClick={handleSaveSettings}
                className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors"
              >
                <Check className="w-4 h-4" />
                Save Preferences
              </button>
            ) : (
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gold/30 text-gold font-body text-sm font-semibold tracking-wider uppercase hover:border-gold/60 hover:text-gold-light transition-colors"
              >
                <Settings2 className="w-4 h-4" />
                Cookie Settings
              </button>
            )}
            <button
              onClick={handleAcceptAll}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors"
            >
              Accept All
            </button>
            <button
              onClick={handleRejectAll}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gold/10 text-cream/60 font-body text-sm tracking-wider uppercase hover:text-cream hover:border-gold/30 transition-colors"
            >
              Reject All
            </button>
          </div>

          {/* Privacy link */}
          <p className="font-body text-xs text-gold-muted/60 mt-4">
            Read our{" "}
            <a href="/privacy" className="underline hover:text-gold transition-colors">
              Privacy Policy
            </a>{" "}
            for more details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
