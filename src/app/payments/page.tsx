import { AppShell } from "@/components/layout/AppShell";
import { CheckCircle2, XCircle, Clock, Calendar } from "lucide-react";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import PaymentRowActions from "./PaymentRowActions";
import { SubmitPaymentTrigger } from "@/components/ui/SubmitPaymentTrigger";
import { Pagination } from "@/components/ui/Pagination";
import ExportButton from "./ExportButton";
import YearFilter from "./YearFilter";

export default async function PaymentsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page || 1);
    const limit = Number(resolvedSearchParams.limit || 10);
    const currentYear = new Date().getFullYear();
    const selectedYear = resolvedSearchParams.year ? parseInt(resolvedSearchParams.year as string) : currentYear;

    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";

    const where: any = {
        paymentCircle: selectedYear
    };

    const [paymentsRaw, pageData] = await prisma.payment.paginate({
        where,
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    }).withPages({ includePageCount: true, page, limit });

    // Sanitize payments for Client Components (Serialization Fix)
    const payments = paymentsRaw.map(p => ({
        ...p,
        amount: Number(p.amount),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }));

    // Fetch available years for the filter
    const yearsData = await prisma.target.findMany({
        distinct: ['year'],
        select: { year: true },
        orderBy: { year: 'desc' }
    });
    const availableYears = yearsData.length > 0 ? yearsData.map(p => p.year) : [currentYear];
    if (!availableYears.includes(currentYear)) availableYears.push(currentYear);
    availableYears.sort((a, b) => b - a);

    return (
        <AppShell>
            <div className="flex flex-col gap-6">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Payments</h1>
                        <p className="text-sm text-slate-500 font-medium">Manage and track community contributions</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {isAdmin && <ExportButton year={selectedYear} />}
                        <SubmitPaymentTrigger />
                    </div>
                </header>

                <div className="flex justify-start mb-2">
                    <YearFilter
                        availableYears={availableYears}
                        selectedYear={selectedYear}
                    />
                </div>

                <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] dark:bg-slate-800/50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Member</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                                            {payment.user?.name || "Unknown"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            ₦ {payment.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.status === "CONFIRMED" && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-[#2cd48b] text-[#2cd48b] bg-[#2cd48b]/10">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> CONFIRMED
                                                </span>
                                            )}
                                            {payment.status === "PENDING" && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-finance-gold text-finance-gold bg-finance-gold/10">
                                                    <Clock className="w-3.5 h-3.5" /> PENDING
                                                </span>
                                            )}
                                            {payment.status === "REJECTED" && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-[#ef4444] text-[#ef4444] bg-[#ef4444]/10">
                                                    <XCircle className="w-3.5 h-3.5" /> REJECTED
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <PaymentRowActions payment={payment} isAdmin={isAdmin} user={session?.user} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y dark:divide-slate-500 divide-slate-800/10">
                        {payments.map((payment) => (
                            <div key={payment.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{payment.user?.name || "Unknown"}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(payment.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900 dark:text-white">₦ {payment.amount.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <div>
                                        {payment.status === "CONFIRMED" && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#2cd48b] text-[#2cd48b] bg-[#2cd48b]/10">
                                                <CheckCircle2 className="w-3 h-3" /> CONFIRMED
                                            </span>
                                        )}
                                        {payment.status === "PENDING" && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-finance-gold text-finance-gold bg-finance-gold/10">
                                                <Clock className="w-3 h-3" /> PENDING
                                            </span>
                                        )}
                                        {payment.status === "REJECTED" && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#ef4444] text-[#ef4444] bg-[#ef4444]/10">
                                                <XCircle className="w-3 h-3" /> REJECTED
                                            </span>
                                        )}
                                    </div>
                                    <PaymentRowActions payment={payment} isAdmin={isAdmin} user={session?.user} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Pagination pageData={pageData} baseUrl="/payments" />
            </div>
        </AppShell>
    );
}
