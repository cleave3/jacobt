'use client'

import { useState, useEffect } from 'react'
import { Download, Share, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)
    const [showPrompt, setShowPrompt] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

    useEffect(() => {
        const _isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(_isIOS)

        const _isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        setIsStandalone(_isStandalone)

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Logic to show prompt after a short delay for iOS
        const timer = setTimeout(() => {
            if (_isIOS && !_isStandalone) {
                setShowPrompt(true);
            }
        }, 3000);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User responded to the install prompt with: ${outcome}`);

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    if (isStandalone || !showPrompt) {
        return null // Don't show if already installed or not ready
    }

    return (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-finance-gold" />

                <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Download className="w-4 h-4 text-finance-gold" /> Install Jacobt App
                </h3>

                <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
                    Install the app on your home screen for a faster, native experience.
                </p>

                {isIOS ? (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                            To install on iOS: tap the share button <Share className="w-3 h-3 inline mx-1 text-blue-500" />
                            and then <span className="font-bold text-slate-900 dark:text-white">"Add to Home Screen"</span> <PlusSquare className="w-3 h-3 inline mx-1" />
                        </p>
                    </div>
                ) : (
                    <Button
                        className="w-full bg-finance-gold hover:bg-finance-goldLight text-white font-bold h-11 rounded-xl shadow-md"
                        onClick={handleInstallClick}
                        disabled={!deferredPrompt}
                    >
                        Add to Home Screen
                    </Button>
                )}

                <button
                    onClick={() => setShowPrompt(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
                >
                    <PlusSquare className="w-4 h-4 rotate-45" />
                </button>
            </div>
        </div>
    )
}
