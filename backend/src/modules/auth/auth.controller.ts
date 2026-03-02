import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { AuthRequest } from '../../core/middlewares'

export class AuthController {
    private authService: AuthService

    constructor() {
        this.authService = new AuthService()
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { phone, password } = req.body

            if (!phone || !password) {
                res.status(400).json({ message: 'Phone and password are required' })
                return
            }

            const { user, accessToken, refreshToken } = await this.authService.login(phone, password)

            // Set cookie for access token (24 hours)
            res.cookie('jwt', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            })

            // Set cookie for refresh token (7 days)
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })

            res.status(200).json({
                message: 'Login successful',
                user
            })
        } catch (error: any) {
            if (error.message === 'Invalid credentials') {
                res.status(401).json({ message: 'Invalid phone number or password' })
            } else {
                res.status(500).json({ message: 'Internal server error', error: error.message })
            }
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0)
        })

        res.cookie('refreshToken', '', {
            httpOnly: true,
            expires: new Date(0)
        })

        res.status(200).json({ message: 'Logged out successfully' })
    }

    async me(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' })
                return
            }

            const user = await this.authService.getUserById(req.user.userId)
            res.status(200).json({ user })
        } catch (error: any) {
            if (error.message === 'User not found') {
                res.status(404).json({ message: 'User not found' })
            } else {
                res.status(500).json({ message: 'Internal server error', error: error.message })
            }
        }
    }

    async refresh(req: Request, res: Response): Promise<void> {
        try {
            const token = req.cookies.refreshToken

            if (!token) {
                res.status(401).json({ message: 'No refresh token provided' })
                return
            }

            const { accessToken, user } = await this.authService.refresh(token)

            // Set new access token cookie
            res.cookie('jwt', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            })

            res.status(200).json({
                message: 'Token refreshed successfully',
                user
            })
        } catch (error: any) {
            // If refresh fails (expired or invalid), clear the cookies to force re-login
            res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) })
            res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) })
            res.status(401).json({ message: 'Invalid or expired refresh token' })
        }
    }
}
