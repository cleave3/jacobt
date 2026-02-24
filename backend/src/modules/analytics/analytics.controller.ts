import { Request, Response } from 'express'
import { AnalyticsService } from './analytics.service'
import { AuthRequest } from '../../core/middlewares'

export class AnalyticsController {
    private analyticsService: AnalyticsService

    constructor() {
        this.analyticsService = new AnalyticsService()
    }

    async getAnalytics(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' })
                return
            }

            const yearParam = req.query.year as string
            const selectedYear = yearParam ? parseInt(yearParam) : new Date().getFullYear()

            const availableTargets = await this.analyticsService.getAvailableYears()
            const availableYears = availableTargets.map((t: any) => t.year)

            const analyticsData = await this.analyticsService.getAnalytics(selectedYear)

            res.status(200).json({
                success: true,
                availableYears: availableYears.length > 0 ? availableYears : [selectedYear],
                selectedYear,
                data: analyticsData
            })
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message })
        }
    }

    async upsertTarget(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
                res.status(403).json({ message: 'Forbidden: Admins only' })
                return
            }

            const { year, individualTarget, numOfPayments, numOfMembers } = req.body

            if (!year || individualTarget === undefined || numOfPayments === undefined || numOfMembers === undefined) {
                res.status(400).json({ message: 'Missing required fields for target' })
                return
            }

            await this.analyticsService.upsertTarget({ year, individualTarget, numOfPayments, numOfMembers })
            res.status(200).json({ success: true, message: 'Target successfully updated' })
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message })
        }
    }
}
