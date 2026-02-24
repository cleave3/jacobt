import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes'
import usersRoutes from '../modules/users/users.routes'
import paymentsRoutes from '../modules/payments/payments.routes'
import assetsRoutes from '../modules/assets/assets.routes'
import analyticsRoutes from '../modules/analytics/analytics.routes'
import pushRoutes from '../modules/push/push.routes'

const router = Router()

// Mount Routes
router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/payments', paymentsRoutes)
router.use('/assets', assetsRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/push', pushRoutes)

export default router