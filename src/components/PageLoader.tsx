import { Suspense, lazy, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import wreathImg from "@/assets/laurel-wreath.png";

const PageLoader = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[70] bg-navy-dark flex items-center justify-center animate-fade-in">
          <div className="flex flex-col items-center gap-3">
            <img
              src={wreathImg}
              alt=""
              className="w-10 h-10 object-contain animate-pulse"
            />
            <div className="w-8 h-[2px] bg-gold/40 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gold animate-[shimmer_0.8s_ease-in-out_infinite] origin-left" />
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default PageLoader;
