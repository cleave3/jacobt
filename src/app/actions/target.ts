"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertTarget(data: { year: number; individualTarget: number; numOfPayments: number; numOfMembers: number }) {
    try {
        await prisma.target.upsert({
            where: { year: data.year },
            create: {
                year: data.year,
                individualTarget: data.individualTarget,
                numOfPayments: data.numOfPayments,
                numOfMembers: data.numOfMembers
            },
            update: {
                individualTarget: data.individualTarget,
                numOfPayments: data.numOfPayments,
                numOfMembers: data.numOfMembers
            }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error upserting target:", error);
        return { success: false, error: "Failed to save target" };
    }
}
