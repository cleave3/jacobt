import { Response } from 'express'
import { PaymentsService } from './payments.service'
import { AuthRequest } from '../../core/middlewares'
import { submitPaymentSchema, updatePaymentSchema, queryPaymentsSchema } from './payments.schema'

export class PaymentsController {
    private paymentsService: PaymentsService

    constructor() {
        this.paymentsService = new PaymentsService()
    }

    async submitPayment(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' })
                return
            }

            const validation = submitPaymentSchema.safeParse(req.body)
            if (!validation.success) {
                const errorMessages = validation.error?.errors?.map((e: any) => e.message).join(', ') || 'Validation error'
                res.status(400).json({ success: false, message: errorMessages })
                return
            }

            const payment = await this.paymentsService.submitPayment(
                req.user.userId,
                validation.data,
                req.user.role
            )
            res.status(201).json({ success: true, payment })
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message })
        }
    }

    async updatePayment(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
                res.status(403).json({ message: 'Forbidden' })
                return
            }

            const { id } = req.params
            const validation = updatePaymentSchema.safeParse(req.body)
            if (!validation.success) {
                const errorMessages = validation.error?.errors?.map((e: any) => e.message).join(', ') || 'Validation error'
                res.status(400).json({ success: false, message: errorMessages })
                return
            }

            const payment = await this.paymentsService.updatePayment(id, validation.data, req.user.userId)
            res.status(200).json({ success: true, payment })
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message })
        }
    }

    async getPayments(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' })
                return
            }

            const queryValidation = queryPaymentsSchema.safeParse(req.query)
            const queryData = queryValidation.success ? queryValidation.data : req.query

            const page = parseInt(queryData.page as string) || 1
            const limit = parseInt(queryData.limit as string) || 10
            const year = queryData.year && queryData.year !== 'ALL' ? parseInt(queryData.year as string) : undefined
            const userId = queryData.userId as string | undefined
            const status = queryData.status as string | undefined
            const startDate = queryData.startDate as string | undefined
            const endDate = queryData.endDate as string | undefined
            const search = queryData.search as string | undefined

            const result = await this.paymentsService.getPayments({
                page,
                limit,
                year,
                userId,
                status,
                startDate,
                endDate,
                search,
            })

            res.status(200).json({ success: true, ...result })
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message })
        }
    }

    async exportPayments(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
                res.status(403).json({ message: 'Forbidden' })
                return
            }

            const year = req.query.year && req.query.year !== 'ALL' ? parseInt(req.query.year as string) : undefined
            const userId = req.query.userId as string | undefined
            const status = req.query.status as string | undefined
            const startDate = req.query.startDate as string | undefined
            const endDate = req.query.endDate as string | undefined
            const search = req.query.search as string | undefined

            const csv = await this.paymentsService.exportPayments({
                year,
                userId,
                status,
                startDate,
                endDate,
                search,
            })

            const filename = year ? `payments-${year}.csv` : `payments-all.csv`
            res.setHeader('Content-Type', 'text/csv')
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
            res.status(200).send(csv)
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message })
        }
    }
}
