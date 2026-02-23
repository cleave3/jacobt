"use client";

// import { useState, useEffect } from "react";

import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
    // const { theme, setTheme } = useTheme();
    const { data: session } = useSession();
    // const [mounted, setMounted] = useState(false);

    // useEffect(() => {
    //     setMounted(true);
    // }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />

            <main className="flex-1 overflow-y-auto pb-16 md:pb-0 relative bg-slate-50 dark:bg-[#0f172a] flex flex-col">
                <header className="sticky top-0 z-40 h-16 bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="md:hidden w-8 h-8 rounded-lg overflow-hidden shrink-0">
                            <img src="/logo.png" alt="Jacobt Logo" width={32} height={32} className="object-cover" />
                        </div>
                        <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                            {session?.user?.name || "Jacobt"}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-500 hover:text-red-600 transition-all active:scale-95 border border-slate-100 dark:border-slate-800 rounded-lg hover:border-red-100 hover:bg-red-50 dark:hover:bg-red-900/10 shadow-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 w-full mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
