import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { AppShell } from "@/components/layout/AppShell"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Phone, Shield, Search, Copy, Check, ExternalLink, Users, CreditCard, RotateCcw, X } from "lucide-react"
import { AddMemberButton } from "@/components/ui/AddMemberButton"
import { useQuery } from "@tanstack/react-query"
import { axios } from "@/lib/axios"
import { toast } from "sonner"
import { normalizeUsersList } from "@/lib/utils"

interface MemberUser {
    id: string
    name: string
    phone: string
    role: "SUPERADMIN" | "ADMIN" | "USER"
    createdAt: string
    _count?: {
        payments: number
    }
}

export default function Members() {
    const navigate = useNavigate()
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("ALL")
    const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null)

    const { data: rawUsers, isLoading, error } = useQuery<unknown>({
        queryKey: ['users'],
        queryFn: async (): Promise<MemberUser[]> => {
            const res = await axios.get('/users')
            return normalizeUsersList<MemberUser>(res)
        }
    })

    const copyPhone = (phone: string, id: string) => {
        if (!phone) return
        navigator.clipboard.writeText(phone)
        setCopiedPhoneId(id)
        toast.success(`Copied ${phone} to clipboard`)
        setTimeout(() => setCopiedPhoneId(null), 2000)
    }

    const allMembers: MemberUser[] = normalizeUsersList<MemberUser>(rawUsers)

    const filteredMembers = useMemo(() => {
        return allMembers.filter((m) => {
            const matchesRole = roleFilter === "ALL" || m.role === roleFilter || (roleFilter === "ADMIN_GROUP" && ["ADMIN", "SUPERADMIN"].includes(m.role))
            const query = search.trim().toLowerCase()
            const matchesSearch = !query ||
                (m.name && m.name.toLowerCase().includes(query)) ||
                (m.phone && m.phone.toLowerCase().includes(query))
            return matchesRole && matchesSearch
        })
    }, [allMembers, search, roleFilter])

    if (isLoading) {
        return (
            <AppShell>
                <div className="flex flex-col gap-6 w-full">
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-36" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-10 w-36" />
                    </header>
                    <Skeleton className="h-14 w-full rounded-2xl" />
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex justify-between items-center py-3">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-36" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-5 w-20 rounded-md" />
                                <Skeleton className="h-8 w-24 rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            </AppShell>
        )
    }

    if (error || !rawUsers) {
        return (
            <AppShell>
                <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-[#1e293b] rounded-2xl border border-red-100 dark:border-red-900/30">
                    <p className="text-red-500 font-bold mb-2">Failed to load members data.</p>
                    <p className="text-sm text-slate-500 mb-4">{error?.message || "Please check your network connection and try again."}</p>
                    <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                        Retry
                    </Button>
                </div>
            </AppShell>
        )
    }

    const isFiltered = search.trim().length > 0 || roleFilter !== "ALL"

    return (
        <AppShell>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">
                            Members Directory
                        </h1>
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-[11px] font-bold border border-slate-200 dark:border-slate-700 tracking-wider">
                            {filteredMembers.length} {isFiltered ? `of ${allMembers.length}` : 'Total'}
                        </span>
                    </div>
                    <AddMemberButton />
                </header>

                {/* Search & Filter Bar */}
                <div className="bg-white dark:bg-[#1e293b] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search by member name or phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-9 h-10 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="hidden sm:flex items-center gap-3">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                aria-label="Filter members by role"
                                className="h-10 px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-finance-gold"
                            >
                                <option value="ALL">All Roles</option>
                                <option value="ADMIN_GROUP">Admins & Superadmins</option>
                                <option value="USER">Regular Members</option>
                            </select>

                            {isFiltered && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearch("")
                                        setRoleFilter("ALL")
                                    }}
                                    className="h-10 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                                >
                                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Segmented Role Pills */}
                    <div className="sm:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                        {[
                            { label: "All Members", value: "ALL" },
                            { label: "Admins", value: "ADMIN_GROUP" },
                            { label: "Regular Members", value: "USER" },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setRoleFilter(tab.value)}
                                className={`h-7 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 border ${
                                    roleFilter === tab.value
                                        ? "bg-finance-gold text-white border-finance-gold shadow-sm font-bold"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Table / Mobile Cards */}
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    {filteredMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">No members found</h3>
                            <p className="text-xs text-slate-400 max-w-sm mb-4">
                                {isFiltered ? "No members match your active search or role filter." : "No members are currently enrolled."}
                            </p>
                            {isFiltered && (
                                <button
                                    onClick={() => {
                                        setSearch("")
                                        setRoleFilter("ALL")
                                    }}
                                    className="text-xs font-bold text-finance-gold hover:underline"
                                >
                                    Reset filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-[#f8fafc] dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4">Member</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Phone Number</th>
                                            <th className="px-6 py-4">Joined Date</th>
                                            <th className="px-6 py-4">Contributions</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                        {filteredMembers.map((member) => {
                                            const initials = member.name
                                                ? member.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                                                : "U"
                                            const isAdmin = ["ADMIN", "SUPERADMIN"].includes(member.role)
                                            const joinedDate = new Date(member.createdAt).toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })
                                            const contributionCount = member._count?.payments ?? 0

                                            return (
                                                <tr
                                                    key={member.id}
                                                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                                >
                                                    {/* Member Column */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${isAdmin ? 'bg-finance-gold/15 text-finance-gold border border-finance-gold/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                                                                {initials}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-[14px]">
                                                                    {member.name || "Unknown Member"}
                                                                </p>
                                                                <p className="text-xs text-slate-400 font-medium truncate">
                                                                    ID: {member.id.slice(0, 8)}...
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Role Column */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {member.role === "SUPERADMIN" && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border border-finance-gold text-finance-gold bg-finance-gold/10">
                                                                <Shield className="w-3.5 h-3.5" /> SUPERADMIN
                                                            </span>
                                                        )}
                                                        {member.role === "ADMIN" && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10">
                                                                <Shield className="w-3.5 h-3.5" /> ADMIN
                                                            </span>
                                                        )}
                                                        {member.role === "USER" && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80">
                                                                MEMBER
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Phone Column */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-sm text-slate-800 dark:text-slate-200">
                                                                {member.phone || "—"}
                                                            </span>
                                                            {member.phone && (
                                                                <button
                                                                    onClick={() => copyPhone(member.phone, member.id)}
                                                                    title="Copy phone number"
                                                                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                                >
                                                                    {copiedPhoneId === member.id ? (
                                                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                                    ) : (
                                                                        <Copy className="w-3.5 h-3.5" />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Joined Date */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                            {joinedDate}
                                                        </span>
                                                    </td>

                                                    {/* Contributions Count */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                            <CreditCard className="w-3.5 h-3.5 text-finance-gold" />
                                                            {contributionCount} {contributionCount === 1 ? 'payment' : 'payments'}
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate(`/payments?userId=${member.id}`)}
                                                            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-finance-gold hover:bg-finance-gold/10 rounded-xl"
                                                        >
                                                            <span>View Payments</span>
                                                            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View (iOS-Style Fluid Contact List) */}
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.04 }
                                    }
                                }}
                                initial="hidden"
                                animate="visible"
                                className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60"
                            >
                                {filteredMembers.map((member) => {
                                    const initials = member.name
                                        ? member.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                                        : "U"
                                    const isAdmin = ["ADMIN", "SUPERADMIN"].includes(member.role)
                                    const joinedDate = new Date(member.createdAt).toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })
                                    const contributionCount = member._count?.payments ?? 0

                                    return (
                                        <motion.div
                                            key={member.id}
                                            variants={{
                                                hidden: { opacity: 0, y: 10 },
                                                visible: { opacity: 1, y: 0 }
                                            }}
                                            whileTap={{ scale: 0.985 }}
                                            className="p-3.5 sm:p-4 flex flex-col gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm uppercase shrink-0 shadow-sm ${
                                                        isAdmin 
                                                            ? 'bg-finance-gold/15 text-finance-gold border border-finance-gold/30 shadow-finance-gold/10' 
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                                    }`}>
                                                        {initials}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                                                {member.name || "Unknown Member"}
                                                            </h3>
                                                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 uppercase tracking-wider ${
                                                                member.role === "SUPERADMIN"
                                                                    ? "bg-finance-gold/15 text-finance-gold border border-finance-gold/30"
                                                                    : member.role === "ADMIN"
                                                                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                                                            }`}>
                                                                <Shield className="w-2.5 h-2.5" /> {member.role}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            <span className="font-mono text-xs">{member.phone || "No phone"}</span>
                                                            {member.phone && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => copyPhone(member.phone, member.id)}
                                                                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                                    title="Copy phone"
                                                                >
                                                                    {copiedPhoneId === member.id ? (
                                                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                                    ) : (
                                                                        <Copy className="w-3.5 h-3.5" />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Direct Call Quick Action */}
                                                {member.phone && (
                                                    <a
                                                        href={`tel:${member.phone}`}
                                                        className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                                                        title="Call member"
                                                    >
                                                        <Phone className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                                                <span className="text-slate-400 text-[11px]">
                                                    Joined <strong className="text-slate-700 dark:text-slate-300 font-semibold">{joinedDate}</strong>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/payments?userId=${member.id}`)}
                                                    className="h-7 px-2.5 rounded-lg text-xs font-semibold text-finance-gold bg-finance-gold/10 hover:bg-finance-gold/20 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                                                >
                                                    <CreditCard className="w-3 h-3" />
                                                    <span>{contributionCount} {contributionCount === 1 ? 'payment' : 'payments'}</span>
                                                    <ExternalLink className="w-3 h-3 ml-0.5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </motion.div>
                        </>
                    )}
                </div>
            </div>
        </AppShell>
    )
}

