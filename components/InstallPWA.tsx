"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 bg-plum text-cream rounded-xl p-4 shadow-lg z-50 flex items-start gap-3">
      <Download size={20} className="text-amber flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="text-sm font-medium">Install Maccha Bazar</div>
        <p className="text-xs text-cream/60 mt-1">Add the app to your home screen for quick access.</p>
        <button
          onClick={async () => {
            if (deferredPrompt) {
              deferredPrompt.prompt();
              await deferredPrompt.userChoice;
              setDeferredPrompt(null);
              setVisible(false);
            }
          }}
          className="mt-3 bg-amber text-[#412402] text-xs font-medium px-3 py-1.5 rounded-lg"
        >
          Install
        </button>
      </div>
      <button aria-label="Dismiss" onClick={() => setVisible(false)} className="text-cream/50">
        <X size={16} />
      </button>
    </div>
  );
}
