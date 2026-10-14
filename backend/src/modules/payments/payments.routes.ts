import { Router } from 'express'
import { PaymentsController } from './payments.controller'
import { authenticate } from '../../core/middlewares'

const router = Router()
const paymentsController = new PaymentsController()

router.get('/', authenticate, paymentsController.getPayments.bind(paymentsController))
router.post('/', authenticate, paymentsController.submitPayment.bind(paymentsController))
router.patch('/:id', authenticate, paymentsController.updatePayment.bind(paymentsController))
router.put('/:id', authenticate, paymentsController.updatePayment.bind(paymentsController))
router.get('/export', authenticate, paymentsController.exportPayments.bind(paymentsController))

export default router
