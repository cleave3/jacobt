import { Router } from 'express'
import { AnalyticsController } from './analytics.controller'
import { authenticate } from '../../core/middlewares'

const router = Router()
const analyticsController = new AnalyticsController()

router.get('/', authenticate, analyticsController.getAnalytics.bind(analyticsController))
router.post('/target', authenticate, analyticsController.upsertTarget.bind(analyticsController))

export default router
