import { owi } from 'owi-validator'

export const submitPaymentSchema = owi.object({
    amount: owi.number("Amount must be a number"),
    paymentCircle: owi.number("Payment circle is required"),
    proofUrl: owi.string().min(1, "Proof image URL is required"),
    userId: owi.string().optional(),
    paymentDate: owi.string().optional(),
})

export const updatePaymentSchema = owi.object({
    amount: owi.number().optional(),
    status: owi.enum(["PENDING", "CONFIRMED", "REJECTED"]).optional(),
    paymentCircle: owi.number().optional(),
    paymentDate: owi.string().optional(),
    rejectionReason: owi.string().optional(),
})

export const queryPaymentsSchema = owi.object({
    page: owi.string().optional(),
    limit: owi.string().optional(),
    year: owi.string().optional(),
    userId: owi.string().optional(),
    status: owi.enum(["ALL", "PENDING", "CONFIRMED", "REJECTED"]).optional(),
    startDate: owi.string().optional(),
    endDate: owi.string().optional(),
    search: owi.string().optional(),
})
