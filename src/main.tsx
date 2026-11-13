import { createRoot } from "react-dom/client";
import "@/i18n";
import App from "./App.tsx";
import "./index.css";
import { captureConfirmToken } from "@/lib/confirm-token";

// Before anything renders or loads tracking: keep the one-time token out of analytics.
captureConfirmToken();

createRoot(document.getElementById("root")!).render(<App />);
