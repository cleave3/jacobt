import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const body = await req.json();
        const { status, rejectionReason } = body;

        // Ensure status is valid
        if (!["CONFIRMED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
        }

        const payment = await prisma.payment.findUnique({
            where: { id: resolvedParams.id },
            include: { user: true }
        });

        if (!payment) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        // Only allow transitions from PENDING
        if (payment.status !== "PENDING") {
            return NextResponse.json({ error: `Cannot transition from ${payment.status} state` }, { status: 400 });
        }

        // Update payment state
        const updatedPayment = await prisma.payment.update({
            where: { id: resolvedParams.id },
            data: {
                status,
                // Assuming you add 'rejectionReason' to the schema later, omit for now to prevent mapping errors.
                // We will handle notifications via Push later.
            }
        });

        return NextResponse.json({ success: true, payment: updatedPayment });

    } catch (error: any) {
        console.error("Admin Payment Patch Error:", error);
        return NextResponse.json({ error: "Failed to process payment update" }, { status: 500 });
    }
}
