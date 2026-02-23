"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { broadcastNotification } from "@/app/actions/pwa";

export async function createAsset(data: any) {
    try {
        const asset = await prisma.asset.create({
            data: {
                name: data.name,
                location: data.location,
                dimensions: data.dimensions,
                purchasePrice: data.purchasePrice,
                currentValue: data.currentValue,
                purchaseDate: new Date(data.purchaseDate),
                description: data.description,
                images: data.images || [],
                associatedUsersId: data.associatedUsersId || [],
                status: "ACTIVE"
            }
        });

        // Broadcast notification
        await broadcastNotification(
            "New Property Added",
            `${asset.name} has been added to our portfolio at ${asset.location}.`
        );

        revalidatePath("/properties");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error creating asset:", error);
        return { success: false, error: "Failed to create asset" };
    }
}

export async function updateAsset(id: string, data: any) {
    try {
        await prisma.asset.update({
            where: { id },
            data: {
                name: data.name,
                location: data.location,
                dimensions: data.dimensions,
                purchasePrice: data.purchasePrice,
                currentValue: data.currentValue,
                purchaseDate: new Date(data.purchaseDate),
                description: data.description,
                images: data.images || [],
                associatedUsersId: data.associatedUsersId || []
            }
        });

        revalidatePath("/properties");
        revalidatePath(`/properties/${id}`);
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error updating asset:", error);
        return { success: false, error: "Failed to update asset" };
    }
}

export async function deleteAsset(id: string) {
    try {
        await prisma.asset.delete({
            where: { id }
        });

        revalidatePath("/properties");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error deleting asset:", error);
        return { success: false, error: "Failed to delete asset" };
    }
}
