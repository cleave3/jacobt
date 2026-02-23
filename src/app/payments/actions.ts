"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { broadcastNotification, notifyUser } from "@/app/actions/pwa";

export async function updatePayment(paymentId: string, data: {
    amount?: number;
    status?: "PENDING" | "CONFIRMED" | "REJECTED";
    paymentCircle?: number;
    proofUrl?: string;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !["ADMIN", "SUPERADMIN"].includes((session.user as any).role)) {
            return { success: false, error: "Unauthorized access" };
        }

        const payment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                ...data,
                amount: data.amount !== undefined ? Number(data.amount) : undefined
            },
            include: { user: true }
        });

        // Notify user about verification
        if (data.status === "CONFIRMED") {
            await notifyUser(
                payment.userId,
                "Payment Verified! ✅",
                `Your payment of ₦${payment.amount.toLocaleString()} for ${payment.paymentCircle} has been confirmed.`
            );
        } else if (data.status === "REJECTED") {
            await notifyUser(
                payment.userId,
                "Payment Rejected ❌",
                `Your payment was rejected. Please check the reason in the payments tab.`
            );
        }

        revalidatePath("/payments");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Error updating payment:", error);
        return { success: false, error: "Failed to update payment" };
    }
}

export async function submitPayment(data: {
    userId: string;
    amount: number;
    paymentCircle: number;
    proofUrl: string;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: "Unauthenticated" };

        const isAdmin = (session.user as any).role === "ADMIN";

        // If not admin, you can only submit for yourself
        const targetUserId = isAdmin ? data.userId : (session.user as any).id;

        const payment = await prisma.payment.create({
            data: {
                userId: targetUserId,
                amount: data.amount,
                paymentCircle: data.paymentCircle,
                proofImage: data.proofUrl,
                status: "PENDING"
            },
            include: { user: true }
        });

        // Broadcast to admins (simplified as broadcast)
        await broadcastNotification(
            "New Payment Submission",
            `${payment.user.name} has submitted a payment of ₦${payment.amount.toLocaleString()}. Awaiting review.`
        );

        revalidatePath("/payments");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Error submitting payment:", error);
        return { success: false, error: "Failed to submit payment" };
    }
}
export async function exportPayments(year: number) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return { success: false, error: "Unauthorized access" };
        }

        const payments = await prisma.payment.findMany({
            where: { paymentCircle: year },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });

        const headers = ["Member", "Amount", "Year", "Status", "Date"];
        const rows = payments.map(p => [
            p.user?.name || "Unknown",
            p.amount.toString(),
            p.paymentCircle.toString(),
            p.status,
            p.createdAt.toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        return { success: true, csvContent };
    } catch (error) {
        console.error("Error exporting payments:", error);
        return { success: false, error: "Failed to export data" };
    }
}
