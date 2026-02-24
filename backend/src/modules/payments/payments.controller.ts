import { Request, Response } from 'express'
import { PaymentsService } from './payments.service'
import { AuthRequest } from '../../core/middlewares'

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

            const { amount, paymentCircle, proofUrl, userId } = req.body

            if (!amount || !paymentCircle || !proofUrl) {
                res.status(400).json({ message: 'Missing required fields' })
                return
            }

            const payment = await this.paymentsService.submitPayment(req.user.userId, { amount, paymentCircle, proofUrl, userId }, req.user.role)
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
            const data = req.body

            const payment = await this.paymentsService.updatePayment(id, data, req.user.userId)
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

            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 10
            const year = req.query.year ? parseInt(req.query.year as string) : undefined

            const result = await this.paymentsService.getPayments(page, limit, year)
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

            const year = parseInt(req.query.year as string)
            if (!year) {
                res.status(400).json({ message: 'Year query parameter is required' })
                return
            }

            const csv = await this.paymentsService.exportPayments(year)
            res.setHeader('Content-Type', 'text/csv')
            res.setHeader('Content-Disposition', `attachment filename=payments-${year}.csv`)
            res.status(200).send(csv)
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message })
        }
    }
}
