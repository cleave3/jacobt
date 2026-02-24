import { Router } from 'express'
import { UsersController } from './users.controller'
import { authenticate } from '../../core/middlewares'

const router = Router()
const usersController = new UsersController()

// Profile Routes
router.get('/profile', authenticate, usersController.getProfile.bind(usersController))
router.put('/profile/password', authenticate, usersController.changePassword.bind(usersController))

// Admin / General User Routes
router.get('/', authenticate, usersController.getAllUsers.bind(usersController))
router.post('/', authenticate, usersController.createUser.bind(usersController))

export default router
