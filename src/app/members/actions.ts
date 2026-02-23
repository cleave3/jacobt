"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { broadcastNotification } from "@/app/actions/pwa";

export async function addMember(formData: any) {
    const { name, phone, password, role } = formData;

    if (!name || !phone || !password) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { phone }
        });

        if (existingUser) {
            return { success: false, error: "Member with this phone number already exists" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await prisma.user.create({
            data: {
                name,
                phone,
                password: hashedPassword,
                role: role || "USER",
            }
        });

        // Broadcast notification
        await broadcastNotification(
            "New Community Member",
            `${name} has just joined the Jacobt community! Welcome!`
        );

        revalidatePath("/members");
        return { success: true };
    } catch (error) {
        console.error("Error adding member:", error);
        return { success: false, error: "Failed to create member account" };
    }
}
export async function getMembers() {
    try {
        const members = await prisma.user.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true }
        });
        return { success: true, members };
    } catch (error) {
        console.error("Error fetching members:", error);
        return { success: false, error: "Failed to fetch members" };
    }
}
