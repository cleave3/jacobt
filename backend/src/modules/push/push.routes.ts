import { Router } from 'express'
import { PushController } from './push.controller'
import { authenticate } from '../../core/middlewares'

const router = Router()
const pushController = new PushController()

router.post('/subscribe', authenticate, pushController.subscribe.bind(pushController))
router.post('/unsubscribe', authenticate, pushController.unsubscribe.bind(pushController))
router.post('/test', authenticate, pushController.testPush.bind(pushController))

export default router
