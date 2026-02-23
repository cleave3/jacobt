
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Phone, Shield } from "lucide-react";
import prisma from "@/lib/prisma";
import { AddMemberButton } from "@/components/ui/AddMemberButton";

export default async function MembersPage() {
    const rawMembers = await prisma.user.findMany({
        orderBy: { name: 'asc' }
    });

    const members = rawMembers.map(user => {
        const initials = user.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || "U";
        const isAdmin = user.role === "ADMIN";

        return {
            initials,
            name: user.name || "Unknown User",
            phone: user.phone,
            isAdmin,
            color: isAdmin ? "bg-finance-gold text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
        };
    });

    return (
        <AppShell>
            <div className="flex flex-col gap-6">
                <header className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Members</h1>
                        <div className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                            {members.length} Total
                        </div>
                    </div>
                    <AddMemberButton />
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 md:pb-0">
                    {members.map((member, index) => (
                        <Card key={index} className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-row items-center gap-4 rounded-xl hover:shadow-md transition-shadow">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${member.color}`}>
                                {member.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="font-bold text-[15px] text-slate-900 dark:text-white truncate">{member.name}</h3>
                                    {member.isAdmin && (
                                        <span className="inline-flex items-center gap-1 bg-finance-gold text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm uppercase tracking-wider">
                                            <Shield className="w-2.5 h-2.5" /> Admin
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                    <Phone className="w-3.5 h-3.5 shrink-0" />
                                    <span className="text-[13px] font-medium truncate">{member.phone}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </AppShell>
    );
}
