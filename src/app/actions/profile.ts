'use server'

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getProfileMetrics() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                payments: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!user) return { success: false, error: "User not found" };

        const totalContribution = user.payments
            .filter(p => p.status === "CONFIRMED")
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const pendingPayments = user.payments
            .filter(p => p.status === "PENDING").length;

        return {
            success: true,
            user: {
                name: user.name,
                phone: user.phone,
                role: user.role,
                createdAt: user.createdAt,
            },
            metrics: {
                totalContribution,
                pendingPayments,
                totalPayments: user.payments.length,
            }
        };
    } catch (error) {
        console.error("Error fetching profile metrics:", error);
        return { success: false, error: "Failed to fetch profile data" };
    }
}

export async function changePassword(formData: any) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const { currentPassword, newPassword } = formData;

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) return { success: false, error: "User not found" };

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return { success: false, error: "Incorrect current password" };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword }
        });

        return { success: true };
    } catch (error) {
        console.error("Error changing password:", error);
        return { success: false, error: "Failed to change password" };
    }
}
