import { Router } from 'express'
import { AuthController } from './auth.controller'
import { authenticate } from '../../core/middlewares'

const router = Router()
const authController = new AuthController()

router.post('/login', authController.login.bind(authController))
router.post('/logout', authController.logout.bind(authController))
router.get('/me', authenticate, authController.me.bind(authController))

export default router
