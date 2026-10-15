
import { Sidebar } from "./Sidebar"
import { BottomNav } from "./BottomNav"
import { UserNavDropdown } from "./UserNavDropdown"
import { usePushNotifications } from "@/hooks/usePushNotifications"

export function AppShell({ children }: { children: React.ReactNode }) {
    usePushNotifications()

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />

            <main className="flex-1 overflow-y-auto pb-28 md:pb-0 relative bg-slate-50 dark:bg-[#0f172a] flex flex-col">
                <header className="sticky top-0 z-40 min-h-16 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm pt-safe">
                    <div className="flex items-center gap-2.5">
                        <div className="md:hidden w-8 h-8 rounded-lg overflow-hidden shrink-0">
                            <img src="/logo.png" alt="Jacobt Logo" width={32} height={32} className="object-cover" />
                        </div>
                        <h2 className="font-heading font-bold text-lg md:text-xl text-slate-900 dark:text-white tracking-tight">
                            Jacobt
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <UserNavDropdown />
                    </div>
                </header>

                <div className="flex-1 w-full mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>

            <BottomNav />
        </div>
    )
}
