import { Request, Response } from 'express'
import { UsersService } from './users.service'
import { AuthRequest } from '../../core/middlewares'

export class UsersController {
    private usersService: UsersService

    constructor() {
        this.usersService = new UsersService()
    }

    async getProfile(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' })
                return
            }

            const metrics = await this.usersService.getProfileMetrics(req.user.userId)
            res.status(200).json(metrics)
        } catch (error: any) {
            if (error.message === 'User not found') {
                res.status(404).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Internal server error', error: error.message })
            }
        }
    }

    async changePassword(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' })
                return
            }
            const { currentPassword, newPassword } = req.body

            if (!currentPassword || !newPassword) {
                res.status(400).json({ message: 'All password fields are required' })
                return
            }

            await this.usersService.changePassword(req.user.userId, currentPassword, newPassword)
            res.status(200).json({ message: 'Password changed successfully' })
        } catch (error: any) {
            if (error.message === 'Incorrect current password') {
                res.status(400).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Internal server error', error: error.message })
            }
        }
    }

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await this.usersService.getAllUsers()
            res.status(200).json({ users })
        } catch (error: any) {
            res.status(500).json({ message: 'Internal server error', error: error.message })
        }
    }

    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const { name, phone, password, role } = req.body

            if (!name || !phone || !password) {
                res.status(400).json({ message: 'Name, phone, and password are required' })
                return
            }

            const user = await this.usersService.createUser({ name, phone, password, role })

            res.status(201).json({ message: 'User created successfully', user: { id: user.id } })
        } catch (error: any) {
            // Handle unique constraint error
            if (error.code === 'P2002') {
                res.status(400).json({ message: 'Phone number already exists' })
            } else {
                res.status(500).json({ message: 'Internal server error', error: error.message })
            }
        }
    }
}
